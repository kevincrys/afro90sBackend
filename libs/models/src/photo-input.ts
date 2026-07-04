import { z } from 'zod';

export const PhotoInputUrlSchema = z.object({
  type: z.literal('url'),
  value: z.string().url(),
});

export const PhotoInputBase64Schema = z.object({
  type: z.literal('base64'),
  value: z.string().min(1),
  filename: z.string().optional(),
  contentType: z.string().optional(),
});

export const PhotoInputStreamSchema = z.object({
  type: z.literal('stream'),
  fieldName: z.string().min(1),
});

export const PhotoInputSchema = z.discriminatedUnion('type', [
  PhotoInputUrlSchema,
  PhotoInputBase64Schema,
  PhotoInputStreamSchema,
]);

export type PhotoInput = z.infer<typeof PhotoInputSchema>;
export type PhotoInputUrl = z.infer<typeof PhotoInputUrlSchema>;
export type PhotoInputBase64 = z.infer<typeof PhotoInputBase64Schema>;
export type PhotoInputStream = z.infer<typeof PhotoInputStreamSchema>;

export const MAX_PHOTOS_PER_PRODUCT = 10;
