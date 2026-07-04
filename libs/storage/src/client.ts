import { S3Client } from '@aws-sdk/client-s3';

let s3Client: S3Client | undefined;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
    });
  }
  return s3Client;
}

/** @internal test helper */
export function resetS3ClientForTests(): void {
  s3Client = undefined;
}

export function getAssetsBucket(): string {
  const name = process.env.ASSETS_BUCKET;
  if (!name) {
    throw new Error('ASSETS_BUCKET env var is required');
  }
  return name;
}

export function getAssetsCdnUrl(): string {
  const url = process.env.ASSETS_CDN_URL;
  if (!url) {
    throw new Error('ASSETS_CDN_URL env var is required');
  }
  return url.replace(/\/$/, '');
}
