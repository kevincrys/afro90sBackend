import { randomUUID } from 'node:crypto';
import {
  ApiError,
  normalizeNameLower,
  ProductSchema,
  type AdminCreateProductBody,
  type AdminUpdateProductBody,
  type Product,
  type UpdateProductInput,
  type UpdateStockInput,
} from '@afro90s/models';
import { getProductRepository, type ProductRepository } from '@afro90s/repositories';
import type { PhotoFileMap } from './photo-input.service';
import { getPhotoInputService, type PhotoInputService } from './photo-input.service';

export class AdminProductService {
  constructor(
    private readonly repository: ProductRepository = getProductRepository(),
    private readonly photos: PhotoInputService = getPhotoInputService(),
  ) {}

  async createProduct(
    input: AdminCreateProductBody,
    files: PhotoFileMap = {},
  ): Promise<Product> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const photoUrls = await this.photos.resolvePhotoUrls(id, input.photos, files);

    const product = ProductSchema.parse({
      id,
      name: input.name,
      nameLower: normalizeNameLower(input.name),
      description: input.description,
      price: input.price,
      quantity: input.quantity,
      photos: photoUrls,
      category: input.category,
      options: input.options,
      createdAt: now,
      updatedAt: now,
    });

    await this.repository.create(product);
    return product;
  }

  async updateProduct(
    id: string,
    input: AdminUpdateProductBody,
    files: PhotoFileMap = {},
  ): Promise<Product> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new ApiError('NOT_FOUND', 'Produto não encontrado.');
    }

    const updateFields: UpdateProductInput = {};

    if (input.name !== undefined) {
      updateFields.name = input.name;
    }
    if (input.description !== undefined) {
      updateFields.description = input.description;
    }
    if (input.price !== undefined) {
      updateFields.price = input.price;
    }
    if (input.quantity !== undefined) {
      updateFields.quantity = input.quantity;
    }
    if (input.category !== undefined) {
      updateFields.category = input.category;
    }
    if (input.options !== undefined) {
      updateFields.options = input.options;
    }

    if (input.photos !== undefined) {
      const photoUrls = await this.photos.resolvePhotoUrls(id, input.photos, files);
      updateFields.photos = photoUrls;

      const removed = existing.photos.filter((url) => !photoUrls.includes(url));
      await this.photos.deleteCdnPhotos(removed);
    }

    const updated = await this.repository.update(id, updateFields);
    if (!updated) {
      throw new ApiError('NOT_FOUND', 'Produto não encontrado.');
    }

    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    const existing = await this.repository.getById(id);
    if (!existing) {
      throw new ApiError('NOT_FOUND', 'Produto não encontrado.');
    }

    await this.photos.deleteCdnPhotos(existing.photos);
    await this.repository.delete(id);
  }

  async updateStock(id: string, input: UpdateStockInput): Promise<{ id: string; quantity: number }> {
    const updated = await this.repository.updateStock(id, input.delta);
    if (!updated) {
      throw new ApiError('NOT_FOUND', 'Produto não encontrado.');
    }

    return { id: updated.id, quantity: updated.quantity };
  }
}

let defaultService: AdminProductService | undefined;

export function getAdminProductService(): AdminProductService {
  if (!defaultService) {
    defaultService = new AdminProductService();
  }
  return defaultService;
}

/** @internal test helper */
export function resetAdminProductServiceForTests(): void {
  defaultService = undefined;
}
