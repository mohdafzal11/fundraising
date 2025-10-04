import { NextResponse, NextRequest } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs/promises';
import { URL } from 'url';
import { prisma } from '@/lib/prisma';
import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: 'bucket.droomdroom.online',
  port: 443,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY || 'Gxf9Y8c5pJy3RY6vyS9n',
  secretKey: process.env.MINIO_SECRET_KEY || '8piyA69z7HVSgvGfp1wXIByIbcll7jOYKCQ6djB3',
});

const BUCKET_NAME = 'fundraisingbucket';
const PRESIGNED_URL_EXPIRY = parseInt(process.env.PRESIGNED_URL_EXPIRY || '604800');


export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://droomdroom.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  });
}

interface ImageProcessorOptions {
  backgroundImageName: string;
  logoUrl?: string;
  width: number;
  height: number;
  logoSize: number;
  fallbackImagePath?: string;
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400, headers: corsHeaders });
    }

    const project = await prisma.project.findFirst({
      where: { slug },
      include: {
        rounds: { include: { investments: { include: { investor: true } } } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404, headers: corsHeaders });
    }

    let logoUrl = project.logo || '';

    const timestamp = Date.now();

    let logoPresignedUrl = '';
    if (logoUrl) {
      try {
        new URL(logoUrl);
        
        const response = await fetch(logoUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch logo: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/png';

        let extension = '.png';
        if (contentType.includes('jpeg') || contentType.includes('jpg')) {
          extension = '.jpg';
        } else if (contentType.includes('gif')) {
          extension = '.gif';
        } 

        const logoFilename = `logos/${slug}-logo-${timestamp}${extension}`;

        const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
        if (!bucketExists) {
          await minioClient.makeBucket(BUCKET_NAME);
          console.log(`Bucket '${BUCKET_NAME}' created.`);
        }

        await minioClient.putObject(
          BUCKET_NAME,
          logoFilename,
          buffer,
          buffer.length,
          { 'Content-Type': contentType }
        );

        logoPresignedUrl = await minioClient.presignedGetObject(BUCKET_NAME, logoFilename, PRESIGNED_URL_EXPIRY);

        await prisma.project.update({
          where: { slug },
          data: { logo: logoPresignedUrl },
        });

        logoUrl = logoPresignedUrl;
      } catch (logoError: any) {
        console.error('Error uploading logo:', logoError);
      }
    }

    const options: ImageProcessorOptions = {
      backgroundImageName: 'og-image.png',
      logoUrl,
      width: 1200,
      height: 630,
      logoSize: 300,
      fallbackImagePath: process.env.FALLBACK_IMAGE_PATH,
    };

    const { backgroundImageName, logoUrl: url, width, height, logoSize, fallbackImagePath } = options;

    const backgroundImagePath = path.join(process.cwd(), 'public', 'images', backgroundImageName);

    let imagePath = backgroundImagePath;
    try {
      await fs.access(backgroundImagePath);
    } catch (error) {
      if (fallbackImagePath) {
        try {
          await fs.access(fallbackImagePath);
          imagePath = fallbackImagePath;
        } catch (fallbackError) {
          throw new Error(
            `Neither background image (${backgroundImageName}) nor fallback image exists. Ensure files are in public/images/ or provide a valid fallback path.`
          );
        }
      } else {
        throw new Error(
          `Background image file not found: ${backgroundImageName}. Ensure it exists in public/images/.`
        );
      }
    }

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    let bgImage;
    try {
      bgImage = await loadImage(imagePath);
      ctx.drawImage(bgImage, 0, 0, width, height);
    } catch (error) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }

    if (url) {
      try {
        new URL(url);
        const logoImg = await loadImage(url);

        const logoX = (width - logoSize) / 2;
        const logoY = (height - logoSize) / 2 + 30;

        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(logoX, logoY, logoSize, logoSize);

        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      } catch (error) {
        console.log('Error loading logo:', error);
      }
    }

    const buffer = canvas.toBuffer('image/png');
    const ogFilename = `og-images/${slug}-${timestamp}.png`;

    if (!logoUrl) {
      const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
      if (!bucketExists) {
        await minioClient.makeBucket(BUCKET_NAME);
        console.log(`Bucket '${BUCKET_NAME}' created.`);
      }
    }

    try {
      await minioClient.putObject(
        BUCKET_NAME,
        ogFilename,
        buffer,
        buffer.length,
        { 'Content-Type': 'image/png' }
      );
    } catch (uploadError: any) {
      console.error('Error uploading OG image to storage:', uploadError);
      return NextResponse.json(
        { error: 'Storage upload failed', message: uploadError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    let presignedUrl;
    try {
      presignedUrl = await minioClient.presignedGetObject(BUCKET_NAME, ogFilename, PRESIGNED_URL_EXPIRY);
    } catch (urlError: any) {
      console.error('Error generating OG URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate access URL', message: urlError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      await prisma.project.update({
        where: { slug },
        data: { metaImage: presignedUrl },
      });
    } catch (updateError: any) {
      console.error('Error updating project metaImage:', updateError);
      return NextResponse.json(
        { error: 'Failed to update project metaImage', message: updateError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    const directUrl = `https://${BUCKET_NAME}.bucket.droomdroom.online/${ogFilename}`;

    return NextResponse.json(
      {
        success: true,
        data: presignedUrl,
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'MISS',
        },
      }
    );
  } catch (error: any) {
    console.error({ message: 'Unexpected error in image API', error });
    return NextResponse.json(
      { error: 'Error generating, uploading, or updating image/logo. Check server logs for details.', message: error.message || 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}