import { afterEach, describe, expect, it } from 'vitest';
import { getAllowedOrigin } from './cors';

describe('getAllowedOrigin', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('uses CLOUDFRONT_WEB_URL in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.CLOUDFRONT_WEB_URL = 'https://cdn.example.com';
    expect(getAllowedOrigin()).toBe('https://cdn.example.com');
  });

  it('falls back to localhost in development', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.CLOUDFRONT_WEB_URL;
    expect(getAllowedOrigin()).toBe('http://localhost:5173');
  });
});
