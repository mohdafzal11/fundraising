import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { redisHandler } from '@/lib/redis';

export async function scrapeInvestor(slug:string): Promise<any> {
    const key = `investor:scrape:${slug}`;
    try {
        const cached = await redisHandler.get<any>(key);
        if (cached) return cached;
    } catch (_) {}

    console.log(`🔄 Scraping investor: ${slug}`);
    const response = await axios.get(`https://crypto-fundraising.info/funds/${slug}/`);
    const html = response.data;
    const $ = cheerio.load(html);

    const investor = {
        fund_name: $('.fname').find('p').eq(1).text().trim(),
        logo_img: $('.fundlogoblock').find('img').attr('src'),
        fund_url: `/funds/${slug}/`,
        social_links: $('.fweb a.fundlink').map((i, el) => ({
            url: $(el).attr('href'),
            title: $(el).attr('title') || $(el).attr('href')
        })).get(),
        invested_projects: $('.fprojc span.pcount').eq(0).text().trim(),
        scraped_at: new Date().toISOString(),
    };

    try {
        await redisHandler.set(key, investor, { expirationTime: 60 * 60 * 24 * 7 }); // 7 days
    } catch (_) {}

    return investor;
}

export async function scrapeInvestorsBatch(slugs: string[], concurrency: number = 8): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  let index = 0;
  const total = slugs.length;

  // Try to resolve from Redis first in bulk
  try {
    const redisKeys = slugs.map((s) => `investor:scrape:${s}`);
    const cached = await redisHandler.mget<any>(redisKeys);
    cached.forEach((value, i) => {
      if (value) {
        results[slugs[i]] = value;
      }
    });
  } catch (_) {}

  const toFetch = slugs.filter((s) => !results[s]);
  if (toFetch.length === 0) return results;

  const worker = async () => {
    while (true) {
      const i = index++;
      if (i >= total) break;
      const slug = slugs[i];
      try {
        const inv = await scrapeInvestor(slug);
        if (inv && (inv.fund_name || inv.logo_img)) {
          results[slug] = inv;
        }
      } catch (_) {
      }
    }
  };

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, toFetch.length)) }, () => worker());
  await Promise.all(workers);
  return results;
}

// async function test(){
//     const slug: string = "coinbase-ventures"
//     const investor = await scrapeInvestor(slug);
//     console.log(investor);
//     // fs.writeFileSync('investor.json', JSON.stringify(investor, null, 2));
// }

// test();