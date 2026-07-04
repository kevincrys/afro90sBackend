import { z } from 'zod';
import { ProductOptionSchema, refineUniqueOptions } from './options';
import { MAX_PHOTOS_PER_PRODUCT, PhotoInputSchema } from './photo-input';

export const CategoryEnum = z.enum(['oculos', 'acessorios', 'maquiagem']);
export type Category = z.infer<typeof CategoryEnum>;

export const ProductOptionsSchema = z
  .array(ProductOptionSchema)
  .max(5)
  .superRefine((options, ctx) => refineUniqueOptions(options, ctx));

const descriptionSchema = z.string().max(2000);
const quantitySchema = z.number().int().min(0).max(99999);

const productInputFields = {
  name: z.string().min(2).max(120),
  price: z.number().positive().multipleOf(0.01),
  photos: z.array(z.string().url()),
  category: CategoryEnum,
  options: ProductOptionsSchema.optional(),
};

export const ProductSchema = z.object({
  ...productInputFields,
  id: z.string().uuid(),
  nameLower: z.string(),
  description: descriptionSchema,
  quantity: quantitySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Product = z.infer<typeof ProductSchema>;

const CreateProductBaseSchema = z.object({
  ...productInputFields,
  description: descriptionSchema.default(''),
  quantity: quantitySchema.default(0),
});

export const CreateProductSchema = CreateProductBaseSchema.superRefine((data, ctx) =>
  refineUniqueOptions(data.options, ctx),
);
export type CreateProductInput = z.infer<typeof CreateProductBaseSchema>;

export const UpdateProductSchema = CreateProductBaseSchema.partial().superRefine((data, ctx) =>
  refineUniqueOptions(data.options, ctx),
);
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

const adminProductBodyFields = {
  name: z.string().min(2).max(120),
  description: descriptionSchema.default(''),
  price: z.number().positive().multipleOf(0.01),
  quantity: quantitySchema,
  category: CategoryEnum,
  options: ProductOptionsSchema.optional(),
  photos: z.array(PhotoInputSchema).max(MAX_PHOTOS_PER_PRODUCT).default([]),
};

export const AdminCreateProductBodySchema = z
  .object(adminProductBodyFields)
  .superRefine((data, ctx) => refineUniqueOptions(data.options, ctx));
export type AdminCreateProductBody = z.output<typeof AdminCreateProductBodySchema>;

export const AdminUpdateProductBodySchema = z
  .object({
    name: adminProductBodyFields.name.optional(),
    description: descriptionSchema.optional(),
    price: adminProductBodyFields.price.optional(),
    quantity: adminProductBodyFields.quantity.optional(),
    category: adminProductBodyFields.category.optional(),
    options: adminProductBodyFields.options,
    photos: adminProductBodyFields.photos.optional(),
  })
  .superRefine((data, ctx) => refineUniqueOptions(data.options, ctx));
export type AdminUpdateProductBody = z.output<typeof AdminUpdateProductBodySchema>;

export const UpdateStockSchema = z.object({
  delta: z.number().int().refine((value) => value !== 0, 'delta não pode ser zero.'),
});
export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;
