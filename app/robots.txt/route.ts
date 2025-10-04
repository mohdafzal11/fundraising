import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `# Allow Facebook crawler
User-agent: facebookexternalhit
Allow: /

# Allow all other crawlers
User-agent: *
Allow: /

# Sitemap
Sitemap: https://fundraising-seven.vercel.app/fundraising/sitemap.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}