import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { parse } from 'url';
import { redisHandler } from '@/lib/redis';

interface MetadataResponse {
  title: string;
  description: string;
  image: string;
  url: string;
  domain: string;
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<MetadataResponse | { error: string }>> {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const cachedMetadata = await redisHandler.get<MetadataResponse>(`metadata:${url}`);
    if (cachedMetadata) {
      return NextResponse.json(cachedMetadata, { status: 200 });
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DroomDroomBot/1.0; +https://droomdroom.com/bot)',
      },
      timeout: 5000,
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const parsedUrl = parse(url);
    const domain = parsedUrl.hostname || '';

    const metadata: MetadataResponse = {
      title: ($('title').text() || $('meta[property="og:title"]').attr('content') || 'No Title').trim().substring(0, 100),
      description: ($('meta[name="description"]').attr('content') || 
                  $('meta[property="og:description"]').attr('content') || 
                  'No description available').trim().substring(0, 200),
      image: $('meta[property="og:image"]').attr('content') || 
             $('meta[property="twitter:image"]').attr('content') || 
             '',
      url: url,
      domain: domain,
    };

    if (metadata.image && !metadata.image.startsWith('http')) {
      const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
      metadata.image = metadata.image.startsWith('/')
        ? `${baseUrl}${metadata.image}`
        : `${baseUrl}/${metadata.image}`;
    }

    if (!metadata.image) {
      metadata.image = 'https://via.placeholder.com/800x400?text=No+Image';
    }
    redisHandler.set(`metadata:${url}`, metadata, { expirationTime: 30 * 24 * 60 * 60 });
    const res = NextResponse.json(metadata, { status: 200 });
    res.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    
    return res;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    
    const errorResponse = {
      title: 'Could not fetch metadata',
      description: 'We were unable to retrieve information about this link.',
      image: 'https://via.placeholder.com/800x400?text=Error+Loading+Content',
      url: url,
      domain: parse(url).hostname || '',
      error: 'Failed to fetch metadata'
    };
    
    return NextResponse.json(errorResponse as any, { status: 500 });
  }
}
