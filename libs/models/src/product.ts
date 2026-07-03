import { z } from 'zod';
import { ProductOptionSchema, refineUniqueOptions } from './options';

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
