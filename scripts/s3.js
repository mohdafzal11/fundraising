const Minio = require('minio');
const fs = require('fs');
const path = require('path');

// ==== CONFIGURATION ====
// Replace these with your MinIO/S3 details
const MINIO_ENDPOINT = 'bucket.droomdroom.online';      // e.g., 'localhost' or 'minio.example.com'
const MINIO_PORT = 443;                 // e.g., 9000
const MINIO_USE_SSL = true;             // true if using HTTPS
const MINIO_ACCESS_KEY = 'BjiPqUntAcg2A4IRwReK';
const MINIO_SECRET_KEY = 'VUXjlG2oyy4Idtd4n1nb9CwsNGqawc80TkXcIyeW';
const BUCKET_NAME = 'eventbucket';         // Your bucket name
const FILE_PATH = './example.txt';       // Path to local file to upload
const OBJECT_NAME = path.basename(FILE_PATH); // Name in the bucket

// ==== INITIALIZE CLIENT ====
const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
});

// ==== MAIN FUNCTION ====
async function uploadFile() {
  try {
    // Check if bucket exists; create if not
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`Bucket '${BUCKET_NAME}' created.`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' already exists.`);
    }

    // Upload the file
    await minioClient.fPutObject(BUCKET_NAME, OBJECT_NAME, FILE_PATH);
    console.log(`File '${FILE_PATH}' uploaded as '${OBJECT_NAME}' to bucket '${BUCKET_NAME}'.`);
  } catch (err) {
    console.error('Error:', err);
  }
}

// ==== RUN ====
uploadFile();
