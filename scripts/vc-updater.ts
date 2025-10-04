import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import { Currency, InvestorStatus, ProjectStatus } from '@prisma/client';
import { getInvestorType, getLinks, slugify } from '@/lib/utils';
import { scrapeInvestor } from './scrape-single-investor';

puppeteer.use(StealthPlugin());

// Scraper configuration
const BASE_URL = 'https://crypto-fundraising.info/deal-flow/page/';
const CONCURRENT_PAGES = 5;
const PAGE_TIMEOUT_MS = 45000;
const WAIT_FOR_SELECTOR_TIMEOUT_MS = 15000;
const MAX_PAGES_TO_SCAN = Number(process.env.VC_UPDATER_MAX_PAGES || 30);
const STOP_AFTER_NO_NEW_PAGES = Number(process.env.VC_UPDATER_STOP_AFTER || 3);
const UPDATE_INTERVAL_MS = Number(process.env.VC_UPDATER_INTERVAL_MS || 4 * 60 * 60 * 1000); // default 4 hours
const DRY_RUN = process.argv.includes('--dry-run'); // Add --dry-run flag to only check sync status

// Parse limit flag: --limit N or -n N
let LIMIT_RECORDS: number | null = null;
const limitFlagIndex = process.argv.findIndex(arg => arg === '--limit' || arg === '-n');
if (limitFlagIndex !== -1 && process.argv[limitFlagIndex + 1]) {
  const limitValue = parseInt(process.argv[limitFlagIndex + 1]);
  if (!isNaN(limitValue) && limitValue > 0) {
    LIMIT_RECORDS = limitValue;
    console.log(`⚠️  LIMIT MODE: Will only insert first ${LIMIT_RECORDS} new records (for testing)\n`);
  }
}

// Retry configuration
const MAX_DB_RETRIES = 3;
const DB_RETRY_DELAY_MS = 2000;

// Helper: Retry wrapper for database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_DB_RETRIES
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const isRetryable = 
        error.code === 'P2034' || // Transaction conflict
        error.code === 'P2024' || // Timed out
        error.code === 'P1001' || // Can't reach database
        error.code === 'P1002' || // Connection timeout
        error.message?.includes('timeout') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('ETIMEDOUT');
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = DB_RETRY_DELAY_MS * (attempt + 1);
      console.warn(`⚠️  ${operationName} failed (attempt ${attempt + 1}/${maxRetries}): ${error.code || error.message}`);
      console.warn(`   Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Helper to convert browser cookies to Puppeteer format
function convertCookiesForPuppeteer(cookies: any[]) {
  return cookies.map(cookie => {
    const puppeteerCookie: any = {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly
    };

    if (!cookie.session && cookie.expirationDate) {
      puppeteerCookie.expires = cookie.expirationDate;
    }

    if (cookie.sameSite && cookie.sameSite !== 'no_restriction') {
      puppeteerCookie.sameSite = cookie.sameSite === 'no_restriction' ? 'None' : cookie.sameSite;
    }

    return puppeteerCookie;
  });
}

// Optional cookies to avoid rate limits/login walls (keep empty array if not needed)


const cookiesData: Array<any> = [
    {
        "name": "PHPSESSID",
        "value": "afmnah630edhh0g8n7dc75i3ge",
        "domain": "crypto-fundraising.info",
        "hostOnly": true,
        "path": "/",
        "secure": false,
        "httpOnly": false,
        "sameSite": null,
        "session": true,
        "firstPartyDomain": "",
        "partitionKey": null,
        "storeId": null
    },
    {
        "name": "wp_lang",
        "value": "en_US",
        "domain": "crypto-fundraising.info",
        "hostOnly": true,
        "path": "/",
        "secure": true,
        "httpOnly": true,
        "sameSite": null,
        "session": true,
        "firstPartyDomain": "",
        "partitionKey": null,
        "storeId": null
    },
    {
        "name": "disclaimer",
        "value": "agreed",
        "domain": "crypto-fundraising.info",
        "hostOnly": true,
        "path": "/",
        "secure": true,
        "httpOnly": false,
        "sameSite": null,
        "session": true,
        "firstPartyDomain": "",
        "partitionKey": null,
        "storeId": null
    },
    {
        "name": "__cf_bm",
        "value": "7cCDTzMzuE0hF8Ve39UZ7aKPrA2.iBVHIJRHdPO5bdE-1759524875-1.0.1.1-Iw8bbz95yd5bs9B3AwdXnAQcbF2akC3XYkfC1BX3RQ2e1ZH0ZNd2mnRYYAkk..EFESZxGsz4JTj6kKfWxR9r7nfpZo78FLt2JNW.yJLI.6s",
        "domain": ".crypto-fundraising.info",
        "hostOnly": false,
        "path": "/",
        "secure": true,
        "httpOnly": true,
        "sameSite": "no_restriction",
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1759526675.634,
        "storeId": null
    },
    {
        "name": "breeze_folder_name",
        "value": "e1f1c7f3ae4250e6fb92402edee112f82c2c9dfa",
        "domain": "crypto-fundraising.info",
        "hostOnly": true,
        "path": "/",
        "secure": true,
        "httpOnly": true,
        "sameSite": null,
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1760404242.671,
        "storeId": null
    },
    {
        "name": "wfwaf-authcookie-a3fca445bc272825075a2fe4e2a6d6ca",
        "value": "16704%7Csubscriber%7C%7Ccc3215acf8a758097a7a3706b251007ee34b98a4a289b3f7c281b4c19f0c6c5b",
        "domain": "crypto-fundraising.info",
        "hostOnly": true,
        "path": "/",
        "secure": true,
        "httpOnly": true,
        "sameSite": null,
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1759568075.634,
        "storeId": null
    },
    {
        "name": "wordpress_logged_in_06174467644e9aacb36c8ce5fccef216",
        "value": "amitpandey123121%40gmail.com%7C1760361042%7CSeX30EmE6QufW0v4nffU94pd9thSq4wLnscSvoFaD3r%7C4de52a5337c44cac4ec9aba7e5d7808a116c39b95cce3fc0910bfe1c8afc734a",
        "domain": "crypto-fundraising.info",
        "hostOnly": true,
        "path": "/",
        "secure": true,
        "httpOnly": true,
        "sameSite": null,
        "session": false,
        "firstPartyDomain": "",
        "partitionKey": null,
        "expirationDate": 1760404242.671,
        "storeId": null
    },
    {
        "name": "wordpress_test_cookie",
        "value": "WP%20Cookie%20check",
        "domain": "crypto-fundraising.info",
        "hostOnly": true,
        "path": "/",
        "secure": true,
        "httpOnly": true,
        "sameSite": null,
        "session": true,
        "firstPartyDomain": "",
        "partitionKey": null,
        "storeId": null
    }
];
  

type DealRecord = {
  page: number;
  rank: string;
  project_name: string;
  logo_img: string;
  project_url: string;
  round: string;
  date: string; // site provided date, we will normalize to Date where possible
  raised: number | null;
  fdv: number | null;
  tradable: string;
  categories: string[];
  investors: Array<{ name?: string; url?: string }>;
};

async function createBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection'
    ]
  });
  return browser;
}

async function scrapeDealFlowPage(browser: any, pageNumber: number): Promise<DealRecord[]> {
  let page: any;
  try {
    page = await browser.newPage();
    page.setDefaultTimeout(PAGE_TIMEOUT_MS);
    page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MS);

    if (cookiesData.length > 0) {
      try {
        const puppeteerCookies = convertCookiesForPuppeteer(cookiesData);
        await page.setCookie(...puppeteerCookies);
      } catch (e) {
        console.warn(`[VC] Cookie set warning:`, e);
      }
    }

    const url = `${BASE_URL}${pageNumber}/`;
    console.log(`[VC] Loading page ${pageNumber}: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS });
    await page.waitForSelector('.hp-table.dealflow-table', { timeout: WAIT_FOR_SELECTOR_TIMEOUT_MS });

    // Expand investor lists
    await page.evaluate(() => {
      const spans = document.querySelectorAll('span.moreitems');
      spans.forEach((s: any) => s.click());
    });

    const html = await page.content();
    const $ = cheerio.load(html);
    const records: DealRecord[] = [];

    $('.hp-table-row.hpt-data').each((index, element) => {
      const $row = $(element);

      const rank = $row.find('.hpt-col1').text().trim();

      const $projectLink = $row.find('.hpt-col2 a.t-project-link');
      const project_name = $projectLink.find('.cointitle').text().trim();
      const project_url = $projectLink.attr('href') || '';
      const logo_img = $projectLink
        .find('.cointextbadge')
        .css('background-image')?.replace(/url\(["']?([^"']*)["']?\)/, '$1') || '';

      const cols = $row.find('.hpt-col3, .hpt-col4');
      const round = $(cols[0]).text().trim();
      const date = $(cols[1]).text().trim();

      const raisedNumeric = $(cols[2]).find('.abbrusd.numeric').attr('data-numeric') || '';
      const fdvNumeric = $(cols[3]).find('.abbrusd.numeric').attr('data-numeric') || '';
      const tradable = $(cols[4]).text().trim();

      const categories: string[] = [];
      $row.find('.hpt-col5 .catitem').each((i, el) => {
        categories.push($(el).text().trim());
      });

      const investors: Array<{ name?: string; url?: string }> = [];
      $row.find('.hpt-col6 a[href*="/funds/"]').each((i, el) => {
        const $el = $(el);
        investors.push({
          name: $el.attr('title') || $el.text().trim(),
          url: $el.attr('href') || ''
        });
      });

      records.push({
        page: pageNumber,
        rank,
        project_name,
        logo_img,
        project_url,
        round,
        date,
        raised: raisedNumeric ? parseInt(raisedNumeric) : null,
        fdv: fdvNumeric ? parseInt(fdvNumeric) : null,
        tradable,
        categories,
        investors
      });
    });

    console.log(`[VC] Page ${pageNumber} parsed: ${records.length} records`);
    return records;
  } finally {
    if (page) {
      try { await page.close(); } catch (_) {}
    }
  }
}

// Pre-scrape and cache investor data (call OUTSIDE transaction)
// Only scrapes investors that DON'T exist in DB
async function preScrapeInvestors(investors: Array<{ name?: string; url?: string }>): Promise<Map<string, any>> {
  const scrapedData = new Map<string, any>();
  const allSlugs = new Set<string>();
  
  // Collect all possible slugs
  investors.forEach(inv => {
    const urlSlugRaw = (inv.url || '').split('/').filter(Boolean).pop() || '';
    const nameBasedSlug = inv.name ? slugify(inv.name) : '';
    if (urlSlugRaw) allSlugs.add(urlSlugRaw);
    if (nameBasedSlug) allSlugs.add(nameBasedSlug);
  });

  if (allSlugs.size === 0) {
    console.log(`ℹ️  No investors to check`);
    return scrapedData;
  }

  // Check which investors already exist in DB
  const existingInvestors = await prisma.investor.findMany({
    where: { slug: { in: Array.from(allSlugs) } },
    select: { slug: true }
  });
  const existingSlugs = new Set(existingInvestors.map(inv => inv.slug));

  console.log(`📊 Investors check: ${existingInvestors.length}/${allSlugs.size} already in DB`);

  // Only scrape investors that DON'T exist
  const urlSlugsToScrape = new Set<string>();
  investors.forEach(inv => {
    const urlSlugRaw = (inv.url || '').split('/').filter(Boolean).pop() || '';
    const nameBasedSlug = inv.name ? slugify(inv.name) : '';
    const baseSlug = nameBasedSlug || (urlSlugRaw ? slugify(urlSlugRaw) : '');
    
    // If neither the URL slug nor name slug exists, we need to scrape
    if (!existingSlugs.has(baseSlug) && !existingSlugs.has(urlSlugRaw) && urlSlugRaw) {
      urlSlugsToScrape.add(urlSlugRaw);
    }
  });

  if (urlSlugsToScrape.size === 0) {
    console.log(`✅ All investors already exist in DB, no scraping needed`);
    return scrapedData;
  }

  console.log(`🔍 Pre-scraping ${urlSlugsToScrape.size} missing investors...`);
  let scraped = 0;
  //@ts-ignore
  for (const urlSlug of urlSlugsToScrape) {
    try {
      const data = await scrapeInvestor(urlSlug);
      if (data && data.fund_name) {
        scrapedData.set(urlSlug, data);
        scraped++;
      }
    } catch (_) {}
  }
  console.log(`✅ Pre-scraped ${scraped}/${urlSlugsToScrape.size} missing investors`);
  return scrapedData;
}

// Pre-fetch or create all investors (call OUTSIDE transaction)
// Returns a complete map: all possible slug variants -> investor ID
async function prepareInvestors(
  investors: Array<{ name?: string; url?: string }>,
  scrapedDataCache: Map<string, any>
): Promise<Map<string, string>> {
  const investorIdMap = new Map<string, string>(); // slug -> id (multiple slugs can map to same ID)
  const allSlugs = new Set<string>();
  
  // Step 1: Collect all possible slug variants
  const slugMapping = new Map<string, Set<string>>(); // baseSlug -> [all variants]
  investors.forEach(inv => {
    const urlSlugRaw = (inv.url || '').split('/').filter(Boolean).pop() || '';
    const nameBasedSlug = inv.name ? slugify(inv.name) : '';
    const baseSlug = nameBasedSlug || (urlSlugRaw ? slugify(urlSlugRaw) : '');
    
    if (!slugMapping.has(baseSlug)) {
      slugMapping.set(baseSlug, new Set());
    }
    
    if (urlSlugRaw) {
      slugMapping.get(baseSlug)!.add(urlSlugRaw);
      allSlugs.add(urlSlugRaw);
    }
    if (nameBasedSlug) {
      slugMapping.get(baseSlug)!.add(nameBasedSlug);
      allSlugs.add(nameBasedSlug);
    }
    if (baseSlug) {
      slugMapping.get(baseSlug)!.add(baseSlug);
      allSlugs.add(baseSlug);
    }
  });

  console.log(`📋 Total unique investor references: ${allSlugs.size}`);

  // Step 2: Fetch ALL existing investors by any slug variant
  const existingInvestors = await withRetry(
    () => prisma.investor.findMany({
      where: { slug: { in: Array.from(allSlugs) } },
      select: { id: true, slug: true }
    }),
    'Fetch existing investors'
  );
  
  console.log(`✅ Found ${existingInvestors.length} existing investors in DB`);
  
  // Step 3: Map ALL slug variants to their investor IDs
  existingInvestors.forEach(inv => {
    // Map the actual DB slug
    investorIdMap.set(inv.slug, inv.id);
    
    // Also map all variants that might reference this investor
    slugMapping.forEach((variants, baseSlug) => {
      if (variants.has(inv.slug)) {
        // This investor matches, map all variants to this ID
        variants.forEach(variant => {
          investorIdMap.set(variant, inv.id);
        });
      }
    });
  });

  // Step 4: Identify which investors are missing (no slug variant found in DB)
  const toCreate: Array<{ name?: string; url?: string; baseSlug: string }> = [];
  const processedBaseSlugs = new Set<string>();
  
  investors.forEach(inv => {
    const urlSlugRaw = (inv.url || '').split('/').filter(Boolean).pop() || '';
    const nameBasedSlug = inv.name ? slugify(inv.name) : '';
    const baseSlug = nameBasedSlug || (urlSlugRaw ? slugify(urlSlugRaw) : '');
    
    if (processedBaseSlugs.has(baseSlug)) return;
    processedBaseSlugs.add(baseSlug);
    
    // Check if any variant of this investor exists
    const variants = slugMapping.get(baseSlug) || new Set();
    const hasExisting = Array.from(variants).some(v => investorIdMap.has(v));
    
    if (!hasExisting) {
      toCreate.push({ ...inv, baseSlug });
    }
  });

  // Step 5: Create missing investors
  if (toCreate.length > 0) {
    console.log(`🆕 Creating ${toCreate.length} missing investors...`);
    
    for (const inv of toCreate) {
      const urlSlugRaw = (inv.url || '').split('/').filter(Boolean).pop() || '';
      const nameBasedSlug = inv.name ? slugify(inv.name) : '';
      const baseSlug = inv.baseSlug;
      
      // Get scraped data
      const scraped = scrapedDataCache.get(urlSlugRaw) || null;
      
      // Generate unique slug (check against existing slugs in DB and already created)
      let slugCandidate = baseSlug;
      let attempt = 0;
      while (true) {
        const existsInMap = investorIdMap.has(slugCandidate);
        const existsInDb = await prisma.investor.findUnique({ 
          where: { slug: slugCandidate },
          select: { id: true }
        });
        
        if (!existsInMap && !existsInDb) break;
        
        attempt += 1;
        slugCandidate = `${baseSlug}-${attempt}`;
        if (attempt > 50) {
          console.warn(`⚠️ Could not generate unique slug for ${baseSlug}`);
          break;
        }
      }

      const safeName = (scraped?.fund_name || inv.name || urlSlugRaw || slugCandidate).toString();
      
      try {
        const created = await withRetry(
          () => prisma.investor.create({
            data: {
              name: scraped?.fund_name || safeName,
              slug: slugCandidate,
              status: InvestorStatus.APPROVED,
              logo: scraped?.logo_img || null,
              logoAltText: safeName,
              links: scraped?.social_links ? getLinks(scraped.social_links) : [],
              metaTitle: scraped?.fund_name || safeName,
              metaDescription: `Information about ${scraped?.fund_name || safeName} crypto investor.`,
              metaImage: scraped?.logo_img || null,
              createdAt: new Date(),
              updatedAt: new Date(),
              type: getInvestorType(scraped?.fund_name || safeName),
            },
            select: { id: true, slug: true }
          }),
          `Create investor ${safeName}`
        );
        
        // Map ALL variants to this new investor ID
        const variants = slugMapping.get(baseSlug) || new Set();
        variants.forEach(variant => {
          investorIdMap.set(variant, created.id);
        });
        investorIdMap.set(created.slug, created.id);
        
        console.log(`👤 Created investor: ${safeName} (${created.slug})`);
      } catch (e: any) {
        console.error(`❌ Failed to create investor ${safeName} after ${MAX_DB_RETRIES} attempts:`, e?.code || e?.message);
      }
    }
  }

  console.log(`✅ Investor map ready: ${investorIdMap.size} slug->ID mappings`);
  return investorIdMap;
}

async function upsertDealRecord(
  record: DealRecord, 
  investorIdMap: Map<string, string>
): Promise<'created' | 'skipped'> {
  return await withRetry(
    () => prisma.$transaction(async (tx) => {
    const baseSlug = slugify(record.project_name);
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existingBySlug = await tx.project.findUnique({ where: { slug } });
      const existingByName = await tx.project.findFirst({ where: { name: record.project_name } });
      if (!existingBySlug && !existingByName) break;
      attempt += 1;
      slug = `${baseSlug}-${attempt}`;
      if (attempt > 50) break;
    }

    const projectData = {
      slug,
      name: record.project_name,
      logo: record.logo_img,
      logoAltText: record.project_name,
      category: record.categories || [],
      status: ProjectStatus.APPROVED,
      links: [],
      metaTitle: `${record.project_name} - Crypto Project`,
      metaImage: record.logo_img,
    } as const;

    let project = await tx.project.findFirst({ where: { OR: [{ slug }, { name: record.project_name }] } });
    if (!project) {
      project = await tx.project.create({ data: { ...projectData } });
      console.log(`✅ Created project: ${record.project_name}`);
    } else {
      const needsLightUpdate = (!project.logo && record.logo_img) || (!project.metaImage && record.logo_img);
      if (needsLightUpdate) {
        await tx.project.update({
          where: { id: project.id },
          data: {
            logo: record.logo_img ?? project.logo,
            metaImage: record.logo_img ?? project.metaImage,
          },
        });
      }
    }

    // Upsert round
    let createdSomething = false;
    if (record.round && record.date) {
      // Parse date string like "Oct 2025" or "31 Oct 2025" to proper Date
      let normalizedDate: Date;
      const dateStr = record.date.trim();
      
      // Month name to number mapping
      const monthMap: Record<string, number> = {
        'jan': 0, 'january': 0,
        'feb': 1, 'february': 1,
        'mar': 2, 'march': 2,
        'apr': 3, 'april': 3,
        'may': 4,
        'jun': 5, 'june': 5,
        'jul': 6, 'july': 6,
        'aug': 7, 'august': 7,
        'sep': 8, 'september': 8,
        'oct': 9, 'october': 9,
        'nov': 10, 'november': 10,
        'dec': 11, 'december': 11
      };
      
      // Try parsing "MMM YYYY" or "DD MMM YYYY" format first
      const monthYearMatch = dateStr.match(/^(\w+)\s+(\d{4})$/);
      const dayMonthYearMatch = dateStr.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
      
      if (monthYearMatch) {
        // Format: "Oct 2025" or "October 2025"
        const monthName = monthYearMatch[1].toLowerCase();
        const year = parseInt(monthYearMatch[2]);
        const monthNum = monthMap[monthName];
        
        if (monthNum !== undefined) {
          // Set to first day of that month (using UTC to avoid timezone issues)
          normalizedDate = new Date(Date.UTC(year, monthNum, 1));
          console.log(`📅 Parsed "${record.date}" (${monthName}) -> ${normalizedDate.toISOString()}`);
        } else {
          console.warn(`⚠️  Unknown month: "${monthName}", using current date`);
          normalizedDate = new Date();
        }
      } else if (dayMonthYearMatch) {
        // Format: "31 Oct 2025"
        const day = parseInt(dayMonthYearMatch[1]);
        const monthName = dayMonthYearMatch[2].toLowerCase();
        const year = parseInt(dayMonthYearMatch[3]);
        const monthNum = monthMap[monthName];
        
        if (monthNum !== undefined) {
          normalizedDate = new Date(Date.UTC(year, monthNum, day));
          console.log(`📅 Parsed "${record.date}" -> ${normalizedDate.toISOString()}`);
        } else {
          console.warn(`⚠️  Unknown month: "${monthName}", using current date`);
          normalizedDate = new Date();
        }
      } else {
        // Try direct parse as fallback
        normalizedDate = new Date(record.date);
        if (isNaN(normalizedDate.getTime())) {
          console.warn(`⚠️  Could not parse date: "${record.date}", using current date`);
          normalizedDate = new Date();
        } else {
          console.log(`📅 Parsed "${record.date}" -> ${normalizedDate.toISOString()}`);
        }
      }
      
      const normalizedAmount = String(record.raised ?? '0');
      const normalizedType = String(record.round ?? 'Unknown');

      let round = await tx.round.findFirst({
        where: {
          projectId: project.id,
          type: normalizedType,
          date: normalizedDate,
          amount: normalizedAmount,
        },
      });

      if (!round) {
        round = await tx.round.create({
          data: {
            projectId: project.id,
            type: normalizedType,
            date: normalizedDate,
            amount: normalizedAmount,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        createdSomething = true;
        console.log(`💰 Added round for ${record.project_name}: ${normalizedType} (${normalizedAmount})`);
      }

      // Get investor IDs from pre-created map
      if (record.investors && record.investors.length > 0) {
        const investorIds: string[] = [];
        for (const inv of record.investors) {
          const urlSlugRaw = (inv.url || '').split('/').filter(Boolean).pop() || '';
          const nameBasedSlug = inv.name ? slugify(inv.name) : '';
          const baseSlug = nameBasedSlug || (urlSlugRaw ? slugify(urlSlugRaw) : '');
          
          // Look up from pre-created map
          const id = investorIdMap.get(urlSlugRaw) || investorIdMap.get(baseSlug);
          if (id) investorIds.push(id);
        }

        if (investorIds.length > 0) {
          const existingInvestments = await tx.investment.findMany({
            where: { roundId: round.id, investorId: { in: investorIds } },
            select: { investorId: true },
          });
          const existingSet = new Set(existingInvestments.map((i) => i.investorId));
          const toCreate = investorIds.filter((id) => !existingSet.has(id));
          if (toCreate.length > 0) {
            const amountPerInvestor = record.raised ? Number(record.raised) / toCreate.length : 0;
            await tx.investment.createMany({
              data: toCreate.map((investorId) => ({
                roundId: round.id,
                investorId,
                amount: String(amountPerInvestor),
                currency: Currency.USD,
                investedAt: normalizedDate,
                createdAt: new Date(),
                updatedAt: new Date(),
              })),
            });
            createdSomething = true;
            console.log(`💸 Added ${toCreate.length} investments for ${record.project_name}`);
          }
        }
      }
    }

    return createdSomething ? 'created' : 'skipped';
  }, { timeout: 30000 }),
    `Upsert deal record for ${record.project_name}`
  );
}

async function dryRunCheck(): Promise<void> {
  const browser = await createBrowser();
  try {
    console.log('\n🔍 ========== DRY RUN MODE ==========');
    console.log('Checking sync status without making any changes...\n');

    // Step 1: Get the latest ROUND from DB (matching API logic)
    const latestRound = await withRetry(
      () => prisma.round.findFirst({
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          project: {
            select: { name: true }
          }
        }
      }),
      'Fetch latest round for dry-run'
    );
    
    if (!latestRound) {
      console.log('⚠️  No rounds found in database. This would be a fresh import.');
      return;
    }

    const latestProject = { 
      name: latestRound.project.name,
      roundDate: latestRound.date,
      roundCreatedAt: latestRound.createdAt 
    };

    console.log(`📌 Latest deal in DB: "${latestProject.name}"`);
    console.log(`   Round date: ${latestProject.roundDate?.toISOString() || 'N/A'}`);
    console.log(`   Round created: ${latestProject.roundCreatedAt.toISOString()}\n`);

    let allNewRecords: DealRecord[] = [];
    let scannedPages = 0;
    let foundLatest = false;

    // Step 2: Scrape pages until we find the latest project
    for (let pageNum = 1; pageNum <= MAX_PAGES_TO_SCAN; pageNum++) {
      console.log(`🔄 Scraping page ${pageNum}...`);
      const records = await scrapeDealFlowPage(browser, pageNum);
      scannedPages++;

      // Debug: show what we're comparing
      if (pageNum <= 5) {
        console.log(`\n[DEBUG] Page ${pageNum} projects (looking for "${latestProject.name}"):`);
        records.forEach((r, idx) => {
          console.log(`  ${idx + 1}. "${r.project_name}" ${r.project_name === latestProject.name ? '← MATCH!' : ''}`);
        });
        console.log('');
      }

      // Check if we found our latest project
      for (const rec of records) {
        if (rec.project_name === latestProject.name) {
          console.log(`✅ Found latest project "${latestProject.name}" on page ${pageNum}.\n`);
          foundLatest = true;
          break;
        }
        allNewRecords.push(rec);
      }

      if (foundLatest) break;
    }

    if (!foundLatest && allNewRecords.length > 0) {
      console.log(`⚠️  Did not find latest project "${latestProject.name}" in first ${scannedPages} pages.`);
      console.log(`   You may be significantly behind or the project name changed.\n`);
    }

    // Step 3: Report findings
    if (allNewRecords.length === 0) {
      console.log('✅ ========== FULLY SYNCED ==========');
      console.log('Your database is up to date with the latest deals!\n');
      return;
    }

    console.log(`📊 ========== SYNC STATUS ==========`);
    console.log(`Projects behind: ${allNewRecords.length}`);
    console.log(`Pages scanned: ${scannedPages}`);
    console.log(`\n📋 New projects found (in scraped order):\n`);

    // Show in scraped order first
    allNewRecords.forEach((rec, idx) => {
      console.log(`${idx + 1}. ${rec.project_name}`);
      console.log(`   Round: ${rec.round} | Date: ${rec.date} | Raised: $${rec.raised?.toLocaleString() || 'N/A'}`);
      console.log(`   Categories: ${rec.categories.join(', ') || 'None'}`);
      console.log(`   Investors (${rec.investors.length}): ${rec.investors.map(i => i.name).slice(0, 5).join(', ')}${rec.investors.length > 5 ? '...' : ''}`);
      console.log('');
    });

    // Show insertion order with investor checks
    console.log(`\n🔄 ========== INSERTION ORDER (REVERSED) ==========`);
    console.log('These projects will be added in this order to maintain chronological consistency:\n');
    
    // Pre-fetch all investor slugs from all records
    const allInvestorSlugs = new Set<string>();
    allNewRecords.forEach(rec => {
      rec.investors.forEach(inv => {
        const urlSlugRaw = (inv.url || '').split('/').filter(Boolean).pop() || '';
        const nameBasedSlug = inv.name ? slugify(inv.name) : '';
        const baseSlug = nameBasedSlug || (urlSlugRaw ? slugify(urlSlugRaw) : '');
        if (baseSlug) allInvestorSlugs.add(baseSlug);
        if (urlSlugRaw) allInvestorSlugs.add(urlSlugRaw);
      });
    });

    // Check which investors exist in DB
    const existingInvestors = await withRetry(
      () => prisma.investor.findMany({
        where: { slug: { in: Array.from(allInvestorSlugs) } },
        select: { slug: true, name: true }
      }),
      'Fetch investors for dry-run'
    );
    const investorMap = new Map(existingInvestors.map(inv => [inv.slug, inv.name]));
    
    console.log(`📊 Pre-check: ${existingInvestors.length}/${allInvestorSlugs.size} investors already in DB\n`);
    
    let reversedRecords = [...allNewRecords].reverse();
    
    // Apply limit if specified
    if (LIMIT_RECORDS !== null && reversedRecords.length > LIMIT_RECORDS) {
      console.log(`⚠️  LIMIT MODE: Showing only first ${LIMIT_RECORDS} of ${reversedRecords.length} records\n`);
      reversedRecords = reversedRecords.slice(0, LIMIT_RECORDS);
    }
    
    //@ts-ignore
    for (const [idx, rec] of reversedRecords.entries()) {
      console.log(`Step ${idx + 1}: Insert "${rec.project_name}"`);
      console.log(`   🗓️  Round: ${rec.round} on ${rec.date}`);
      console.log(`   💰 Amount: $${rec.raised?.toLocaleString() || 'N/A'}`);
      console.log(`   🏷️  Categories: ${rec.categories.join(', ') || 'None'}`);
      console.log(`   👥 Investors (${rec.investors.length}):`);
      
      for (const inv of rec.investors) {
        const urlSlugRaw = (inv.url || '').split('/').filter(Boolean).pop() || '';
        const nameBasedSlug = inv.name ? slugify(inv.name) : '';
        const baseSlug = nameBasedSlug || (urlSlugRaw ? slugify(urlSlugRaw) : '');
        
        // Check if exists in DB
        const existsAs = investorMap.get(baseSlug) || investorMap.get(urlSlugRaw);
        if (existsAs) {
          console.log(`      ✅ ${existsAs} (slug: ${investorMap.has(baseSlug) ? baseSlug : urlSlugRaw}) - EXISTS`);
        } else {
          console.log(`      🆕 ${inv.name || 'Unknown'} (slug: ${baseSlug}) - WILL BE SCRAPED & CREATED`);
        }
      }
      console.log('');
    }

    console.log(`\n✅ Dry run complete. Run without --dry-run to apply changes.`);
    console.log(`   Command: npm run vc-updater\n`);
    
  } catch (e: any) {
    console.error('❌ Error during dry run:', e?.message || e);
    throw e;
  } finally {
    try { await browser.close(); } catch (_) {}
  }
}

async function processLatestDeals(): Promise<{ created: number; scannedPages: number }> {
  const browser = await createBrowser();
  try {
    // Step 1: Get the latest ROUND from DB to know where to stop (matching API logic)
    const latestRound = await withRetry(
      () => prisma.round.findFirst({
        orderBy: [
          { date: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          project: {
            select: { name: true }
          }
        }
      }),
      'Fetch latest round from DB'
    );
    
    const latestProject = latestRound ? { name: latestRound.project.name } : null;
    
    console.log(`[VC] Latest deal in DB: ${latestProject?.name || 'none'}`);

    let allNewRecords: DealRecord[] = [];
    let scannedPages = 0;
    let foundLatest = false;

    // Step 2: Scrape pages until we find the latest project
    for (let pageNum = 1; pageNum <= MAX_PAGES_TO_SCAN; pageNum++) {
      console.log(`[VC] Scraping page ${pageNum}...`);
      
      let records: DealRecord[] = [];
      try {
        records = await scrapeDealFlowPage(browser, pageNum);
      } catch (e: any) {
        console.error(`❌ Failed to scrape page ${pageNum}:`, e?.message);
        // Skip this page and continue
        continue;
      }
      scannedPages++;

      // Debug logging on early pages
      if (pageNum <= 5 && latestProject) {
        console.log(`[VC] Page ${pageNum} check - Looking for: "${latestProject.name}"`);
        const projectNames = records.map(r => r.project_name).join(', ');
        console.log(`[VC] Page ${pageNum} projects: ${projectNames}`);
      }

      // Check if we found our latest project
      for (const rec of records) {
        if (latestProject && rec.project_name === latestProject.name) {
          console.log(`[VC] Found latest project "${latestProject.name}" on page ${pageNum}. Stopping scrape.`);
          foundLatest = true;
          break;
        }
        // Add record to our collection (will be processed in reverse)
        allNewRecords.push(rec);
      }

      if (foundLatest) break;

      // Safety: if no latest project and we've scanned enough pages, stop
      if (!latestProject && pageNum >= 5) {
        console.log(`[VC] No existing projects in DB. Stopping after ${pageNum} pages.`);
        break;
      }
    }

    console.log(`[VC] Collected ${allNewRecords.length} new records from ${scannedPages} pages.`);

    // Step 3: Process records in REVERSE order to maintain chronological consistency
    // (newest deals are on page 1, so we reverse to insert oldest-first)
    allNewRecords.reverse();
    
    // Apply limit if specified
    let recordsToProcess = allNewRecords;
    if (LIMIT_RECORDS !== null && allNewRecords.length > LIMIT_RECORDS) {
      recordsToProcess = allNewRecords.slice(0, LIMIT_RECORDS);
      console.log(`[VC] ⚠️  LIMIT: Processing only first ${LIMIT_RECORDS} of ${allNewRecords.length} records`);
    }
    
    console.log(`[VC] Processing ${recordsToProcess.length} records in reverse order (oldest first)...`);

    // Step 1: Pre-scrape all missing investors
    const allInvestors = recordsToProcess.flatMap(rec => rec.investors);
    const scrapedDataCache = await preScrapeInvestors(allInvestors);
    
    // Step 2: Create all missing investors BEFORE transactions
    const investorIdMap = await prepareInvestors(allInvestors, scrapedDataCache);
    console.log(`✅ All investors ready: ${investorIdMap.size} total`);

    // Step 3: Process records with fast transactions (no investor lookups)
    let created = 0;
    let failed = 0;
    for (const rec of recordsToProcess) {
      try {
        const result = await upsertDealRecord(rec, investorIdMap);
        if (result === 'created') {
          created += 1;
        }
      } catch (e: any) {
        failed += 1;
        console.error(`[VC] ❌ Failed to insert ${rec.project_name} after ${MAX_DB_RETRIES} retries:`, e?.code || e?.message);
        // Continue processing other records even if one fails
      }
    }
    
    if (failed > 0) {
      console.warn(`⚠️  ${failed} records failed to insert`);
    }

    console.log(`[VC] Cycle complete: created ${created}/${allNewRecords.length} new records, scanned ${scannedPages} pages.`);
    return { created, scannedPages };
  } catch (e: any) {
    console.error('[VC] Critical error in processLatestDeals:', e?.message || e);
    throw e;
  } finally {
    try { await browser.close(); } catch (_) {}
  }
}

async function runOnce() {
  console.log('[VC] Updater cycle started');
  try {
    const { created, scannedPages } = await processLatestDeals();
    console.log(`[VC] ✅ Updater cycle finished. New: ${created}, Pages: ${scannedPages}`);
  } catch (e: any) {
    console.error('[VC] ❌ Updater cycle failed:', e?.code || e?.message);
    // Don't throw - let the interval continue
  }
}

async function main() {
  if (DRY_RUN) {
    // Dry run mode: just check sync status
    console.log('Running in DRY RUN mode...\n');
    await dryRunCheck();
    return;
  }

  // Normal mode: First immediate run
  await runOnce();
  // Schedule periodic runs
  setInterval(() => {
    runOnce().catch((e) => console.error('[VC] Scheduled run error:', e));
  }, UPDATE_INTERVAL_MS);
}

main().catch((e) => {
  console.error('[VC] Fatal error:', e);
  process.exit(1);
});


