import { NextResponse } from 'next/server';
import { generatProjectSitemaps } from '@/lib/sitemap';

export async function GET(
  request: Request,
  { params }: { params: { index: string } }
) {
  try {
    const index = parseInt(params.index);
    if (isNaN(index) || index < 1) {
      return new NextResponse('Invalid sitemap index', { status: 400 });
    }

    const sitemaps = await generatProjectSitemaps();
    const sitemap = sitemaps.find(s => s.index === index);

    if (!sitemap) {
      return new NextResponse('Sitemap not found', { status: 404 });
    }

    return new NextResponse(sitemap.content, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
} 