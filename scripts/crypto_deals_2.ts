import { prisma } from '../lib/prisma';
import path from 'path';
import { promises as fs } from 'fs';
import { slugify } from '../lib/utils';

type SocialLink = { platform?: string; url: string };
type ScrapedProject = {
  name?: string;
  original_name?: string;
  about?: string;
  rewritten_about?: string;
  links?: { website?: string | null; social?: SocialLink[] };
};

async function updateDescriptionsAndLinks() {
  console.log('🔄 Starting update from crypto_deals_2.json (description + links)...');

  const filePath = path.join(process.cwd(), 'crypto_deals_2.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const projects: ScrapedProject[] = JSON.parse(fileContent);

  console.log(`✅ Loaded ${projects.length} entries from crypto_deals_2.json`);

  let updatedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  for (const p of projects) {
    const name = (p.name || p.original_name || '').trim();
    const aboutCandidate = (p.rewritten_about && p.rewritten_about.trim().length > 0)
      ? p.rewritten_about.trim()
      : (p.about || '').trim();
    if (!name) {
      if (!aboutCandidate) {
        skippedCount++;
        console.warn('⚠️  Skipping entry with no name/original_name and no about text');
        continue;
      } else {
        skippedCount++;
        console.warn('⚠️  Skipping entry with no name/original_name');
        continue;
      }
    }

    const slug = slugify(name);

    try {
      const existing = await prisma.project.findFirst({
        where: {
          OR: [
            { slug },
            { name },
            ...(p.original_name && p.original_name !== name ? [{ name: p.original_name }] : []),
          ],
        },
      });

      if (!existing) {
        notFoundCount++;
        console.warn(`⚠️  Project not found, skipping: ${name} (slug: ${slug})`);
        continue;
      }

      const description = aboutCandidate;

      const links = {
        website: p.links?.website || null,
        social: (p.links?.social || [])
          .filter(s => s && typeof s.url === 'string' && s.url.trim().length > 0)
          .map(s => ({ platform: s.platform, url: s.url }))
      };

      if (!description && (!links.website && (links.social as SocialLink[]).length === 0)) {
        skippedCount++;
        console.log(`ℹ️  Nothing to update for: ${name}`);
        continue;
      }

      await prisma.project.update({
        where: { id: existing.id },
        data: {
          ...(description ? { description } : {}),
          ...(links ? { links } : {}),
          updatedAt: new Date(),
        },
      });

      updatedCount++;
      console.log(`✅ Updated description/links for: ${name}`);
    } catch (err: any) {
      skippedCount++;
      console.error(`❌ Failed updating ${name}:`, err?.message || err);
    }
  }

  console.log('\n=== Update complete ===');
  console.log(`✔️  Updated: ${updatedCount}`);
  console.log(`⏭️  Skipped: ${skippedCount}`);
  console.log(`❓ Not found: ${notFoundCount}`);
}

async function run() {
  await updateDescriptionsAndLinks();
}

run();

// Run with: npx tsx scripts/crypto_deals_2.ts

