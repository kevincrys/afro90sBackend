export {
  getAssetsBucket,
  getAssetsCdnUrl,
  getS3Client,
  resetS3ClientForTests,
} from './client';
export {
  ALLOWED_IMAGE_MIME_TYPES,
  createImageService,
  ImageService,
  MAX_PRODUCT_IMAGE_BYTES,
  type AllowedImageMimeType,
  type ProductImageFile,
} from './image.service';
