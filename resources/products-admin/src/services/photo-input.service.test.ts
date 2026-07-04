import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@afro90s/models';
import { PhotoInputService } from './photo-input.service';

const uploadProductImage = vi.fn();
const deleteProductImage = vi.fn();

vi.mock('@afro90s/storage', () => ({
  createImageService: () => ({
    uploadProductImage,
    deleteProductImage,
  }),
  getAssetsCdnUrl: () => 'https://cdn.example.com',
  MAX_PRODUCT_IMAGE_BYTES: 5 * 1024 * 1024,
}));

describe('PhotoInputService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadProductImage.mockResolvedValue('https://cdn.example.com/products/p1/new.jpg');
  });

  const service = new PhotoInputService();

  it('passes through url photos', async () => {
    const urls = await service.resolvePhotoUrls('p1', [{ type: 'url', value: 'https://x.com/a.jpg' }], {});
    expect(urls).toEqual(['https://x.com/a.jpg']);
    expect(uploadProductImage).not.toHaveBeenCalled();
  });

  it('uploads base64 photos', async () => {
    const buffer = Buffer.from('hello');
    const base64 = buffer.toString('base64');
    const urls = await service.resolvePhotoUrls(
      'p1',
      [{ type: 'base64', value: base64, contentType: 'image/png', filename: 'a.png' }],
      {},
    );
    expect(urls).toHaveLength(1);
    expect(uploadProductImage).toHaveBeenCalledWith('p1', expect.objectContaining({ mimeType: 'image/png' }));
  });

  it('uploads stream photos from multipart map', async () => {
    const urls = await service.resolvePhotoUrls(
      'p1',
      [{ type: 'stream', fieldName: 'photo_0' }],
      {
        photo_0: { buffer: Buffer.from('x'), mimeType: 'image/jpeg', filename: 'a.jpg' },
      },
    );
    expect(urls).toHaveLength(1);
    expect(uploadProductImage).toHaveBeenCalledOnce();
  });

  it('throws when stream field is missing', async () => {
    await expect(
      service.resolvePhotoUrls('p1', [{ type: 'stream', fieldName: 'photo_0' }], {}),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' } satisfies Partial<ApiError>);
  });

  it('parses data URI base64 photos', async () => {
    const buffer = Buffer.from('img');
    const dataUri = `data:image/png;base64,${buffer.toString('base64')}`;
    await service.resolvePhotoUrls('p1', [{ type: 'base64', value: dataUri }], {});
    expect(uploadProductImage).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ mimeType: 'image/png' }),
    );
  });

  it('rejects invalid base64 payload', async () => {
    await expect(
      service.resolvePhotoUrls('p1', [{ type: 'base64', value: '%%%' }], {}),
    ).rejects.toMatchObject({ code: 'INVALID_IMAGE' });
  });

  it('rejects empty base64 payload', async () => {
    await expect(
      service.resolvePhotoUrls('p1', [{ type: 'base64', value: '' }], {}),
    ).rejects.toMatchObject({ code: 'INVALID_IMAGE' });
  });

  it('rejects total payload over limit', async () => {
    const chunk = Buffer.alloc(4 * 1024 * 1024, 1);
    uploadProductImage.mockImplementation(async () => 'https://cdn.example.com/x.jpg');
    await expect(
      service.resolvePhotoUrls(
        'p1',
        [
          { type: 'base64', value: chunk.toString('base64'), contentType: 'image/jpeg' },
          { type: 'base64', value: chunk.toString('base64'), contentType: 'image/jpeg' },
          { type: 'base64', value: chunk.toString('base64'), contentType: 'image/jpeg' },
        ],
        {},
      ),
    ).rejects.toMatchObject({ code: 'PAYLOAD_TOO_LARGE' });
  });

  it('deletes only CDN-hosted product photos', async () => {
    await service.deleteCdnPhotos([
      'https://cdn.example.com/products/p1/a.jpg',
      'https://external.com/b.jpg',
    ]);
    expect(deleteProductImage).toHaveBeenCalledOnce();
  });
});
