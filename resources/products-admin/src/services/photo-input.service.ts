import { raiseApiError, type PhotoInput } from '@afro90s/models';
import { createImageService, getAssetsCdnUrl, MAX_PRODUCT_IMAGE_BYTES, type ImageService } from '@afro90s/storage';
import type { MultipartFile } from '../lib/multipart';

/** Limite total de imagens por request — api-routes.md */
export const MAX_TOTAL_IMAGE_BYTES = 10 * 1024 * 1024;

export interface PhotoFileMap {
  [fieldName: string]: MultipartFile | undefined;
}

export class PhotoInputService {
  constructor(private readonly images: ImageService = createImageService()) {}

  async resolvePhotoUrls(
    productId: string,
    photos: PhotoInput[],
    files: PhotoFileMap,
  ): Promise<string[]> {
    if (photos.length === 0) {
      return [];
    }

    const urls: string[] = [];
    let totalBytes = 0;

    for (const photo of photos) {
      const resolved = await this.resolveOne(productId, photo, files);
      totalBytes += resolved.bytes;
      urls.push(resolved.url);
    }

    if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
      raiseApiError(
        'PAYLOAD_TOO_LARGE',
        'Total de imagens excede o limite permitido.',
        {
          productId,
          totalBytes: String(totalBytes),
          maxBytes: String(MAX_TOTAL_IMAGE_BYTES),
        },
      );
    }

    return urls;
  }

  async deleteCdnPhotos(photos: string[]): Promise<void> {
    const cdnBase = getAssetsCdnUrl();
    const ours = photos.filter((url) => url.startsWith(`${cdnBase}/products/`));

    await Promise.all(ours.map((url) => this.images.deleteProductImage(url)));
  }

  private async resolveOne(
    productId: string,
    photo: PhotoInput,
    files: PhotoFileMap,
  ): Promise<{ url: string; bytes: number }> {
    switch (photo.type) {
      case 'url':
        return { url: photo.value, bytes: 0 };
      case 'base64': {
        const decoded = decodeBase64Photo(productId, photo);
        const url = await this.images.uploadProductImage(productId, decoded);
        return { url, bytes: decoded.buffer.length };
      }
      case 'stream': {
        const file = files[photo.fieldName];
        if (!file) {
          raiseApiError('VALIDATION_ERROR', 'Arquivo de imagem ausente.', {
            productId,
            fieldName: photo.fieldName,
          });
        }
        const url = await this.images.uploadProductImage(productId, {
          buffer: file.buffer,
          mimeType: file.mimeType,
          filename: file.filename,
        });
        return { url, bytes: file.buffer.length };
      }
      default: {
        const _exhaustive: never = photo;
        throw _exhaustive;
      }
    }
  }
}

function decodeBase64Photo(
  productId: string,
  photo: Extract<PhotoInput, { type: 'base64' }>,
): {
  buffer: Buffer;
  mimeType: string;
  filename?: string;
} {
  let payload = photo.value.trim();
  let mimeType = photo.contentType?.trim().toLowerCase();

  const dataUri = /^data:([^;]+);base64,(.+)$/i.exec(payload);
  if (dataUri) {
    mimeType = mimeType ?? dataUri[1].toLowerCase();
    payload = dataUri[2];
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(payload, 'base64');
  } catch {
    raiseApiError('INVALID_IMAGE', 'Imagem base64 inválida.', { productId });
  }

  if (buffer.length === 0) {
    raiseApiError('INVALID_IMAGE', 'Imagem base64 vazia.', { productId });
  }

  if (buffer.length > MAX_PRODUCT_IMAGE_BYTES) {
    raiseApiError(
      'PAYLOAD_TOO_LARGE',
      'Imagem excede o tamanho máximo permitido.',
      {
        productId,
        bytes: String(buffer.length),
        maxBytes: String(MAX_PRODUCT_IMAGE_BYTES),
      },
    );
  }

  return {
    buffer,
    mimeType: mimeType ?? 'image/jpeg',
    filename: photo.filename,
  };
}

let defaultService: PhotoInputService | undefined;

export function getPhotoInputService(): PhotoInputService {
  if (!defaultService) {
    defaultService = new PhotoInputService();
  }
  return defaultService;
}

/** @internal test helper */
export function resetPhotoInputServiceForTests(): void {
  defaultService = undefined;
}
