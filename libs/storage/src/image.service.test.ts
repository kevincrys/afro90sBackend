import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@afro90s/models';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ImageService,
  MAX_PRODUCT_IMAGE_BYTES,
} from './image.service';

const send = vi.fn();
const CDN = 'https://cdn.example.com';
const BUCKET = 'afro90s-dev-s3-assets';
const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('ImageService', () => {
  beforeEach(() => {
    send.mockReset();
    send.mockResolvedValue({});
  });

  const service = new ImageService({ send } as never, BUCKET, CDN);

  it('uploads valid image and returns absolute CDN URL', async () => {
    const buffer = Buffer.alloc(1024);

    const url = await service.uploadProductImage(PRODUCT_ID, {
      buffer,
      mimeType: 'image/jpeg',
      filename: 'photo.jpg',
    });

    expect(url).toMatch(
      new RegExp(`^${CDN.replace(/\./g, '\\.')}/products/${PRODUCT_ID}/[0-9a-f-]+\\.jpg$`),
    );
    expect(send).toHaveBeenCalledOnce();
    const command = send.mock.calls[0][0];
    expect(command.input.Bucket).toBe(BUCKET);
    expect(command.input.Key).toMatch(/^products\/.+\.jpg$/);
    expect(command.input.ContentType).toBe('image/jpeg');
    expect(command.input.Body).toBe(buffer);
  });

  it('rejects unsupported mime type', async () => {
    await expect(
      service.uploadProductImage(PRODUCT_ID, {
        buffer: Buffer.alloc(1),
        mimeType: 'image/gif',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_IMAGE',
      statusCode: 400,
    } satisfies Partial<ApiError>);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects image larger than max size', async () => {
    await expect(
      service.uploadProductImage(PRODUCT_ID, {
        buffer: Buffer.alloc(MAX_PRODUCT_IMAGE_BYTES + 1),
        mimeType: 'image/png',
      }),
    ).rejects.toMatchObject({
      code: 'PAYLOAD_TOO_LARGE',
      statusCode: 413,
    } satisfies Partial<ApiError>);
    expect(send).not.toHaveBeenCalled();
  });

  it('accepts all allowed mime types', () => {
    expect(ALLOWED_IMAGE_MIME_TYPES).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });

  it('deletes object by S3 key', async () => {
    const key = `products/${PRODUCT_ID}/file.webp`;
    await service.deleteProductImage(key);

    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0].input).toMatchObject({
      Bucket: BUCKET,
      Key: key,
    });
  });

  it('infers mime type from filename when mime is empty', async () => {
    const url = await service.uploadProductImage(PRODUCT_ID, {
      buffer: Buffer.alloc(1),
      mimeType: '  ',
      filename: 'photo.webp',
    });

    expect(url).toMatch(/\.webp$/);
    expect(send.mock.calls[0][0].input.ContentType).toBe('image/webp');
  });

  it('uses jpeg extension from filename', async () => {
    await service.uploadProductImage(PRODUCT_ID, {
      buffer: Buffer.alloc(1),
      mimeType: 'image/jpeg',
      filename: 'photo.jpeg',
    });

    expect(send.mock.calls[0][0].input.Key).toMatch(/\.jpg$/);
  });

  it('rejects empty mime when filename has no known extension', async () => {
    await expect(
      service.uploadProductImage(PRODUCT_ID, {
        buffer: Buffer.alloc(1),
        mimeType: '',
        filename: 'photo.bin',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_IMAGE' });
  });

  it('strips leading slash from delete key', async () => {
    await service.deleteProductImage('/products/x/y.png');
    expect(send.mock.calls[0][0].input.Key).toBe('products/x/y.png');
  });
});
