import { NextResponse } from 'next/server';
import { generatProjectSitemaps, generateSitemapIndex } from '@/lib/sitemap';

export async function GET() {
  try {
    const sitemaps = await generatProjectSitemaps();
    const sitemapIndex = generateSitemapIndex(sitemaps);

    return new NextResponse(sitemapIndex, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new NextResponse('Error generating sitemap index', { status: 500 });
  }
} 