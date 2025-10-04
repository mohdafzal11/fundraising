import { NextRequest, NextResponse } from 'next/server'
import * as Minio from 'minio'

const minioClient = new Minio.Client({
  endPoint: 'bucket.droomdroom.online',
  port: 443,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY || 'Gxf9Y8c5pJy3RY6vyS9n',
  secretKey: process.env.MINIO_SECRET_KEY || '8piyA69z7HVSgvGfp1wXIByIbcll7jOYKCQ6djB3',
});

const BUCKET_NAME = 'fundraisingbucket';

// App Router configuration
export const dynamic = 'force-dynamic';

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://droomdroom.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: NextRequest) {
  // Add CORS headers to all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://droomdroom.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  try {
    // Add a timeout to ensure the request is fully processed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let data;
    try {
      data = await req.formData();
    } catch (formError: any) {
      console.error('Error parsing form data:', formError);
      return NextResponse.json(
        { error: 'Invalid form data', message: formError.message },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }
    
    const file = data.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    let buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } catch (bufferError: any) {
      console.error('Error creating buffer:', bufferError);
      return NextResponse.json(
        { error: 'Failed to process file', message: bufferError.message },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const contentType = file.type;

    // Check if bucket exists; create if not
    try {
      const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
      if (!bucketExists) {
        await minioClient.makeBucket(BUCKET_NAME);
        console.log(`Bucket '${BUCKET_NAME}' created.`);
      }
    } catch (bucketError: any) {
      console.error('Error checking/creating bucket:', bucketError);
      return NextResponse.json(
        { error: 'Storage configuration error', message: bucketError.message },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    // Upload the file to MinIO
    try {
      await minioClient.putObject(
        BUCKET_NAME,
        filename,
        buffer,
        buffer.length,
        { 'Content-Type': contentType }
      );
    } catch (uploadError: any) {
      console.error('Error uploading to storage:', uploadError);
      return NextResponse.json(
        { error: 'Storage upload failed', message: uploadError.message },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    // Generate a presigned URL with a 7-day expiry
    let presignedUrl;
    try {
      const expiryInSeconds = 7 * 24 * 60 * 60;
      presignedUrl = await minioClient.presignedGetObject(BUCKET_NAME, filename, expiryInSeconds);
    } catch (urlError: any) {
      console.error('Error generating URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate access URL', message: urlError.message },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    // You might also want to keep the original URL format for reference
    const directUrl = `https://${BUCKET_NAME}.bucket.droomdroom.online/${filename}`;

    return NextResponse.json({
      success: true,
      url: presignedUrl,
      direct_url: directUrl,
      public_id: filename,
    }, {
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', message: error.message || 'Unknown error' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}
