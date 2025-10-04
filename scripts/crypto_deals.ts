import { prisma } from '@/lib/prisma';
import { ProjectStatus, Currency, InvestorStatus } from '@prisma/client';
import path from 'path';
import { promises as fs } from 'fs';
import { slugify, getInvestorType, getLinks } from '@/lib/utils';
import { scrapeInvestor, scrapeInvestorsBatch } from './scrape-single-investor';
import dotenv from 'dotenv';

dotenv.config();

async function addOrUpdateProjects() {
  try {
    const SCRAPE_MISSING = process.env.SCRAPE_MISSING_INVESTORS === 'true';
    console.log('🔄 Starting project data update from JSON file...');

    const filePath = path.join(process.cwd(), 'data', 'crypto_deals.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const projects = JSON.parse(fileContent).reverse();

    console.log(`✅ Read ${projects.length} projects from JSON file`);

    let updatedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    let createdRoundsCount = 0;
    let skippedRoundsCount = 0;
    let totalCount = 0;

    const allInvestorSlugs = new Set<string>();
    projects.forEach((project: any) => {
      if (project.investors && project.investors.length > 0) {
        project.investors.forEach((inv: { url: string }) => {
          const slug = (inv.url || '')
            .toString()
            .split('/')
            .filter(Boolean)
            .pop()?.toLowerCase() || '';
          allInvestorSlugs.add(slug);
        });
      }
    });

    // Load investors master file into memory, keyed strictly by canonical slug
    // Canonical slug preference: slug from fund_url tail if present, else slugify(fund_name)
    let investorMasterBySlug = new Map<string, any>();
    try {
      const investorsFilePath = path.join(process.cwd(), 'data', 'crypto_investors.json');
      const investorsContent = await fs.readFile(investorsFilePath, 'utf-8');
      const investorsJson = JSON.parse(investorsContent);
      for (const inv of investorsJson) {
        const urlSlug = (inv.fund_url || '')
          .toString()
          .split('/')
          .filter(Boolean)
          .pop();
        const urlSlugLower = urlSlug ? urlSlug.toLowerCase() : '';
        const nameSlug = slugify(inv.fund_name || '');
        if (urlSlugLower) investorMasterBySlug.set(urlSlugLower, inv);
        if (nameSlug) investorMasterBySlug.set(nameSlug, inv);
      }
      console.log(`✅ Loaded investor master: ${investorMasterBySlug.size} records`);
    } catch (e) {
      console.warn('ℹ️ Investor master file not found or unreadable. Proceeding without enrichment.');
    }

    const investors = await prisma.investor.findMany({
      where: { slug: { in: Array.from(allInvestorSlugs) } },
      select: { id: true, slug: true },
    });
    const investorMap = new Map(investors.map((inv) => [inv.slug, inv.id]));
    console.log(`✅ Pre-fetched ${investors.length} investors`);

    // Determine which referenced investors are missing from master data
    const missingSlugs = Array.from(allInvestorSlugs).filter((slug) => {
      if (!slug) return false;
      if (investorMap.has(slug)) return false;
      // If present in master by URL or by name, we will create later; here we just compute missing counters
      return true;
    });
    console.log(`🔎 Investors referenced in deals: ${allInvestorSlugs.size}`);
    const toFetchSlugs = missingSlugs.filter((s) => !investorMasterBySlug.has(s));
    console.log(`🧩 Missing in master JSON: ${toFetchSlugs.length}`);

    // Diagnostic: show a small sample of missing slugs
    if (toFetchSlugs.length > 0) {
      console.log(`🔍 Sample missing (first 10): ${toFetchSlugs.slice(0, 100).join(', ')}`);
    }

    // Fetch all missing investors first (scrape) and keep them in memory (only if opted-in)
    if (SCRAPE_MISSING) {
      const concurrency = Number(process.env.SCRAPE_CONCURRENCY || 8);
      const batchResults = await scrapeInvestorsBatch(toFetchSlugs, concurrency);
      const fetchedSlugs = Object.keys(batchResults);
      for (const s of fetchedSlugs) {
        investorMasterBySlug.set(s, batchResults[s]);
      }
      console.log(`✅ Scrape complete. Added ${fetchedSlugs.length} investors to master memory map.`);
    } else {
      console.log('ℹ️ Skipping scraping pass (set SCRAPE_MISSING_INVESTORS=true to enable).');
    }

    // Batch-create any missing investors in DB BEFORE processing projects/rounds
    console.log(`🧩 Missing investors to create in DB: ${missingSlugs.length}`);

    let createdInvestorsCount = 0;
    for (const mSlug of missingSlugs) {
      try {
        // Skip if it appeared while processing (safety)
        const exists = await prisma.investor.findUnique({ where: { slug: mSlug } });
        if (exists) {
          investorMap.set(mSlug, exists.id);
          continue;
        }

        const master = investorMasterBySlug.get(mSlug);
        if (!master) continue; // still no data; skip upfront creation

        const safeName = (master?.fund_name || mSlug.replace(/-/g, ' ')).trim();

        // Generate unique slug starting from the referenced slug
        let slugCandidate = mSlug;
        let attempt = 0;
        while (true) {
          const clash = await prisma.investor.findUnique({ where: { slug: slugCandidate } });
          if (!clash) break;
          attempt += 1;
          slugCandidate = `${mSlug}-${attempt}`;
          if (attempt > 50) break;
        }

        const created = await prisma.investor.create({
          data: {
            name: safeName,
            slug: slugCandidate,
            status: InvestorStatus.APPROVED,
            logo: master?.logo_img || null,
            logoAltText: safeName,
            links: master?.social_links ? getLinks(master.social_links) : null,
            metaTitle: safeName,
            metaDescription: `Information about ${safeName} crypto investor.`,
            metaImage: master?.logo_img || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            type: getInvestorType(safeName),
          },
          select: { id: true, slug: true },
        });

        investorMap.set(mSlug, created.id);
        investorMap.set(created.slug, created.id);
        createdInvestorsCount++;
        if (createdInvestorsCount % 50 === 0) {
          console.log(`👤 Pre-created investors: ${createdInvestorsCount}/${missingSlugs.length}`);
        }
      } catch (e) {
        console.warn(`⚠️ Failed to pre-create investor '${mSlug}':`, (e as Error).message);
      }
    }
    console.log(`✅ Pre-creation done. Investors created: ${createdInvestorsCount}`);

    for (const project of projects) {
      try {
        console.log(`🔄 Processing project: ${project.project_name} (${project.project_url})`);

        // Generate a unique slug per project (one-time). If exists, suffix with -1/-2...
        const baseSlug = slugify(project.project_name);
        let slug = baseSlug;
        let attempt = 0;
        while (true) {
          const existingBySlug = await prisma.project.findUnique({ where: { slug } });
          const existingByName = await prisma.project.findFirst({ where: { name: project.project_name } });
          if (!existingBySlug && !existingByName) break;
          attempt += 1;
          slug = `${baseSlug}-${attempt}`;
          if (attempt > 50) break; // safety
        }

        // Prepare project data for creation or lightweight update
        const projectData = {
          slug,
          name: project.project_name,
          logo: project.logo_img,
          logoAltText: project.project_name,
          category: project.categories || [],
          status: ProjectStatus.APPROVED,
          links: [],
          metaTitle: `${project.project_name} - Crypto Project`,
          metaDescription: `Information about ${project.project_name} crypto project`,
          metaImage: project.logo_img,
        };

    // Optionally pre-enrich missing investors for this project outside the transaction
    if (SCRAPE_MISSING) {
      if (project.investors && project.investors.length > 0) {
        for (const inv of project.investors) {
          try {
            const urlSlugRaw = (inv.url || '').split('/').filter(Boolean).pop() || '';
            const nameBasedSlug = inv.name ? slugify(inv.name) : '';
            const baseSlug = nameBasedSlug || (urlSlugRaw ? slugify(urlSlugRaw) : 'investor');
            if (!investorMasterBySlug.has(baseSlug) && urlSlugRaw) {
              const scraped = await scrapeInvestor(urlSlugRaw);
              if (scraped && scraped.fund_name) {
                investorMasterBySlug.set(baseSlug, scraped);
              }
            }
          } catch (_) {}
        }
      }
    }

        // For each deal-row, ensure the project exists, then upsert a round and its investments
        await prisma.$transaction(
          async (tx) => {
            let projectRecord = await tx.project.findFirst({
              where: {
                OR: [{ slug }, { name: project.project_name }],
              },
            });

            if (!projectRecord) {
              projectRecord = await tx.project.create({ data: { ...projectData } });
              createdCount++;
              console.log(`✅ Created new project: ${project.project_name}`);
            } else {
              // Optionally refresh minimal fields if missing
              const needsLightUpdate =
                (!projectRecord.logo && project.logo_img) ||
                (!projectRecord.metaImage && project.logo_img);
              if (needsLightUpdate) {
                await tx.project.update({
                  where: { id: projectRecord.id },
                  data: {
                    logo: project.logo_img ?? projectRecord.logo,
                    metaImage: project.logo_img ?? projectRecord.metaImage,
                  },
                });
                updatedCount++;
              }
            }

            // Upsert round for this specific deal-row
            if (project.round && project.date) {
              const normalizedDate = new Date(project.date);
              const normalizedAmount = String(project.raised ?? '0');
              const normalizedType = String(project.round ?? 'Unknown');

              let round = await tx.round.findFirst({
                where: {
                  projectId: projectRecord.id,
                  type: normalizedType,
                  date: normalizedDate,
                  amount: normalizedAmount,
                },
              });

              if (!round) {
                round = await tx.round.create({
                  data: {
                    projectId: projectRecord.id,
                    type: normalizedType,
                    date: normalizedDate,
                    amount: normalizedAmount,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                });
                createdRoundsCount++;
                console.log(`💰 Added round for ${project.project_name}: ${normalizedType} (${normalizedAmount})`);
              } else {
                skippedRoundsCount++;
              }

              // Handle investors for this round: ensure they exist, then create investments
              if (project.investors && project.investors.length > 0) {
                // Helper to ensure investor exists in DB (by slug or name), creating if needed
                const ensureInvestor = async (name: string | undefined, url: string | undefined): Promise<string | null> => {
                  const urlSlugRaw = (url || '').split('/').filter(Boolean).pop() || '';
                  const nameBasedSlug = name ? slugify(name) : '';
                  const baseSlug = nameBasedSlug || (urlSlugRaw ? slugify(urlSlugRaw) : 'investor');
                  // check cache first by possible slugs
                  if (investorMap.has(baseSlug)) return investorMap.get(baseSlug)!;
                  if (urlSlugRaw && investorMap.has(urlSlugRaw)) return investorMap.get(urlSlugRaw)!;

                  // look up in DB by slug OR name
                  let existing = await tx.investor.findFirst({
                    where: {
                      OR: [
                        { slug: baseSlug },
                        ...(urlSlugRaw ? [{ slug: urlSlugRaw }] : []),
                        ...(name ? [{ name }] : []),
                      ],
                    },
                    select: { id: true, slug: true },
                  });
                  if (existing) {
                    investorMap.set(existing.slug, existing.id);
                    if (urlSlugRaw) investorMap.set(urlSlugRaw, existing.id);
                    if (baseSlug) investorMap.set(baseSlug, existing.id);
                    return existing.id;
                  }

                  // generate unique slug with suffixing
                  let slugCandidate = baseSlug;
                  let attemptLocal = 0;
                  while (true) {
                    const clash = await tx.investor.findUnique({ where: { slug: slugCandidate } });
                    if (!clash) break;
                    attemptLocal += 1;
                    slugCandidate = `${baseSlug}-${attemptLocal}`;
                    if (attemptLocal > 50) break;
                  }

                  // Create investor record, enriched from master file if available
                  const safeName = name && name.trim().length > 0 ? name : (urlSlugRaw || slugCandidate);
                  const master = investorMasterBySlug.get(baseSlug);
                  const created = await tx.investor.create({
                    data: {
                      name: master?.fund_name || safeName,
                      slug: slugCandidate,
                      status: InvestorStatus.APPROVED,
                      logo: master?.logo_img || null,
                      logoAltText: safeName,
                      links: master?.social_links ? getLinks(master.social_links) : null,
                      metaTitle: master?.fund_name || safeName,
                      metaDescription: `Information about ${master?.fund_name || safeName} crypto investor.`,
                      metaImage: master?.logo_img || null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      type: getInvestorType(master?.fund_name || safeName),
                    },
                    select: { id: true, slug: true },
                  });
                  investorMap.set(created.slug, created.id);
                  if (urlSlugRaw) investorMap.set(urlSlugRaw, created.id);
                  if (baseSlug) investorMap.set(baseSlug, created.id);
                  console.log(`👤 Created investor: ${safeName} (${created.slug})`);
                  return created.id;
                };

                // Resolve all investor IDs for this round
                const uniqueInvestorIds = new Set<string>();
                for (const inv of project.investors) {
                  const investorId = await ensureInvestor(inv.name, inv.url);
                  if (investorId) uniqueInvestorIds.add(investorId);
                }

                const investorIds = Array.from(uniqueInvestorIds);
                if (investorIds.length > 0) {
                  const amountPerInvestor = project.raised ? Number(project.raised) / investorIds.length : 0;
                  // Avoid violating unique (roundId, investorId)
                  const existingInvestments = await tx.investment.findMany({
                    where: {
                      roundId: round.id,
                      investorId: { in: investorIds },
                    },
                    select: { investorId: true },
                  });
                  const existingInvestorIdSet = new Set<string>(existingInvestments.map((i) => i.investorId));
                  const newInvestorIds = investorIds.filter((id: string) => !existingInvestorIdSet.has(id));

                  if (newInvestorIds.length > 0) {
                    await tx.investment.createMany({
                      data: newInvestorIds.map((investorId: string) => ({
                        roundId: round.id,
                        investorId,
                        amount: String(amountPerInvestor),
                        currency: Currency.USD,
                        investedAt: normalizedDate,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      })),
                    });
                    console.log(`💸 Added ${newInvestorIds.length} investments for ${project.project_name}`);
                  }
                } else {
                  console.warn(`⚠️ No valid investors found for project ${project.project_name}`);
                }
              }
            }
          },
          { timeout: 30000 }
        );

        totalCount++;
        console.log('Total processed:', totalCount);
      } catch (projectError) {
        console.error(`❌ Error processing project ${project.project_name}:`, projectError);
        console.error('Project data:', JSON.stringify(project, null, 2));
      }
    }

    console.log(
      `✅ Project update completed: ${createdCount} projects created, ${updatedCount} light-updated, ${skippedCount} skipped (errors). Rounds: ${createdRoundsCount} created, ${skippedRoundsCount} deduplicated`
    );
  } catch (error) {
    console.error('❌ Error updating projects:', error);
    throw error;
  }
}

async function runUpdate() {
  await addOrUpdateProjects();
}

runUpdate();

// npx tsx scripts/crypto_deals.ts