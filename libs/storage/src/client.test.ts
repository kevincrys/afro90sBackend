import { afterEach, describe, expect, it } from 'vitest';
import { createImageService } from './image.service';
import {
  getAssetsBucket,
  getAssetsCdnUrl,
  getS3Client,
  resetS3ClientForTests,
} from './client';

describe('S3 client helpers', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
    resetS3ClientForTests();
  });

  it('creates S3 client singleton', () => {
    resetS3ClientForTests();
    const first = getS3Client();
    const second = getS3Client();
    expect(second).toBe(first);
  });

  it('requires ASSETS_BUCKET', () => {
    delete process.env.ASSETS_BUCKET;
    expect(() => getAssetsBucket()).toThrow('ASSETS_BUCKET');
  });

  it('requires ASSETS_CDN_URL', () => {
    delete process.env.ASSETS_CDN_URL;
    expect(() => getAssetsCdnUrl()).toThrow('ASSETS_CDN_URL');
  });

  it('strips trailing slash from CDN URL', () => {
    process.env.ASSETS_CDN_URL = 'https://cdn.example.com/';
    expect(getAssetsCdnUrl()).toBe('https://cdn.example.com');
  });

  it('returns ASSETS_BUCKET from env', () => {
    process.env.ASSETS_BUCKET = 'afro90s-dev-s3-assets';
    expect(getAssetsBucket()).toBe('afro90s-dev-s3-assets');
  });

  it('createImageService uses env config', () => {
    process.env.ASSETS_BUCKET = 'afro90s-dev-s3-assets';
    process.env.ASSETS_CDN_URL = 'https://cdn.example.com';
    resetS3ClientForTests();
    const service = createImageService();
    expect(service).toBeInstanceOf(Object);
    expect(getS3Client()).toBeDefined();
  });
});
