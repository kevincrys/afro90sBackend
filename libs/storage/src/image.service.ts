import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { raiseApiError } from '@afro90s/models';
import { getAssetsBucket, getAssetsCdnUrl, getS3Client } from './client';

/** Limite por imagem — ver api-routes.md */
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export interface ProductImageFile {
  buffer: Buffer;
  mimeType: string;
  filename?: string;
}

const MIME_TO_EXT: Record<AllowedImageMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export class ImageService {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
    private readonly cdnBaseUrl: string,
  ) {}

  async uploadProductImage(productId: string, file: ProductImageFile): Promise<string> {
    const mimeType = normalizeMimeType(file.mimeType, file.filename);
    assertAllowedMimeType(mimeType);
    assertMaxSize(file.buffer.length);

    const ext = extensionForMime(mimeType, file.filename);
    const objectKey = `products/${productId}/${randomUUID()}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: mimeType,
      }),
    );

    return `${this.cdnBaseUrl}/${objectKey}`;
  }

  async deleteProductImage(key: string): Promise<void> {
    const objectKey = toObjectKey(key, this.cdnBaseUrl);

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
      }),
    );
  }
}

export function createImageService(): ImageService {
  return new ImageService(getS3Client(), getAssetsBucket(), getAssetsCdnUrl());
}

function normalizeMimeType(mimeType: string, filename?: string): string {
  const normalized = mimeType.trim().toLowerCase();
  if (normalized) {
    return normalized;
  }
  return inferMimeFromFilename(filename) ?? '';
}

function inferMimeFromFilename(filename?: string): string | undefined {
  if (!filename) {
    return undefined;
  }
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return undefined;
  }
}

function assertAllowedMimeType(mimeType: string): asserts mimeType is AllowedImageMimeType {
  if (!(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) {
    raiseApiError(
      'INVALID_IMAGE',
      'Formato de imagem não suportado.',
      { mimeType: 'Use image/jpeg, image/png ou image/webp.' },
    );
  }
}

function assertMaxSize(size: number): void {
  if (size > MAX_PRODUCT_IMAGE_BYTES) {
    raiseApiError(
      'PAYLOAD_TOO_LARGE',
      'Imagem excede o tamanho máximo permitido.',
      { size: `Máximo ${MAX_PRODUCT_IMAGE_BYTES} bytes por imagem.` },
    );
  }
}

function extensionForMime(mimeType: AllowedImageMimeType, filename?: string): string {
  if (filename) {
    const fromName = filename.split('.').pop()?.toLowerCase();
    if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
      return fromName === 'jpeg' ? 'jpg' : fromName;
    }
  }
  return MIME_TO_EXT[mimeType];
}

function toObjectKey(keyOrUrl: string, cdnBaseUrl: string): string {
  if (keyOrUrl.startsWith(`${cdnBaseUrl}/`)) {
    return keyOrUrl.slice(cdnBaseUrl.length + 1);
  }
  return keyOrUrl.replace(/^\//, '');
}
