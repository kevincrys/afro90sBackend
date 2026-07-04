import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@afro90s/models';
import { AdminProductService } from './product.service';

const create = vi.fn();
const update = vi.fn();
const deleteRepo = vi.fn();
const getById = vi.fn();
const updateStock = vi.fn();
const resolvePhotoUrls = vi.fn();
const deleteCdnPhotos = vi.fn();

const PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';

const existing = {
  id: PRODUCT_ID,
  name: 'Óculos',
  nameLower: 'oculos',
  description: 'Antiga',
  price: 49.9,
  quantity: 5,
  photos: ['https://cdn.example.com/products/x/old.jpg', 'https://external.com/x.jpg'],
  category: 'oculos' as const,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('AdminProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolvePhotoUrls.mockResolvedValue(['https://cdn.example.com/products/x/a.jpg']);
  });

  const service = () =>
    new AdminProductService(
      { create, update, delete: deleteRepo, getById, updateStock, list: vi.fn() } as never,
      { resolvePhotoUrls, deleteCdnPhotos } as never,
    );

  it('creates product with resolved photo urls', async () => {
    create.mockResolvedValueOnce(undefined);
    const product = await service().createProduct({
      name: 'Óculos',
      description: '',
      price: 49.9,
      quantity: 1,
      category: 'oculos',
      photos: [{ type: 'url', value: 'https://cdn.example.com/existing.jpg' }],
    });

    expect(product.name).toBe('Óculos');
    expect(product.photos).toEqual(['https://cdn.example.com/products/x/a.jpg']);
    expect(create).toHaveBeenCalledOnce();
  });

  it('updates fields and replaces photos', async () => {
    getById.mockResolvedValueOnce(existing);
    update.mockResolvedValueOnce({ ...existing, photos: ['https://cdn.example.com/products/x/new.jpg'] });

    const result = await service().updateProduct(PRODUCT_ID, {
      name: 'Novo nome',
      photos: [{ type: 'url', value: 'https://cdn.example.com/products/x/new.jpg' }],
    });

    expect(result.photos).toEqual(['https://cdn.example.com/products/x/new.jpg']);
    expect(deleteCdnPhotos).toHaveBeenCalledWith([
      'https://cdn.example.com/products/x/old.jpg',
      'https://external.com/x.jpg',
    ]);
    expect(update).toHaveBeenCalledWith(PRODUCT_ID, expect.objectContaining({ name: 'Novo nome' }));
  });

  it('throws when updating missing product', async () => {
    getById.mockResolvedValueOnce(null);
    await expect(service().updateProduct(PRODUCT_ID, { name: 'X' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<ApiError>);
  });

  it('deletes product and cdn photos', async () => {
    getById.mockResolvedValueOnce({
      id: PRODUCT_ID,
      photos: ['https://cdn.example.com/products/x/a.jpg'],
    });
    await service().deleteProduct(PRODUCT_ID);
    expect(deleteCdnPhotos).toHaveBeenCalledOnce();
    expect(deleteRepo).toHaveBeenCalledWith(PRODUCT_ID);
  });

  it('throws when deleting missing product', async () => {
    getById.mockResolvedValueOnce(null);
    await expect(service().deleteProduct(PRODUCT_ID)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<ApiError>);
  });

  it('updates optional fields individually', async () => {
    getById.mockResolvedValueOnce(existing);
    update.mockResolvedValueOnce({ ...existing, description: 'Nova', quantity: 9, category: 'acessorios' });

    await service().updateProduct(PRODUCT_ID, {
      description: 'Nova',
      price: 59.9,
      quantity: 9,
      category: 'acessorios',
      options: ['P'],
    });

    expect(update).toHaveBeenCalledWith(
      PRODUCT_ID,
      expect.objectContaining({
        description: 'Nova',
        price: 59.9,
        quantity: 9,
        category: 'acessorios',
        options: ['P'],
      }),
    );
  });

  it('throws when stock update target is missing', async () => {
    updateStock.mockResolvedValueOnce(null);
    await expect(service().updateStock(PRODUCT_ID, { delta: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('throws when update returns null', async () => {
    getById.mockResolvedValueOnce(existing);
    update.mockResolvedValueOnce(null);

    await expect(
      service().updateProduct(PRODUCT_ID, { name: 'Novo nome' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('updates stock via repository delta', async () => {
    updateStock.mockResolvedValueOnce({ id: PRODUCT_ID, quantity: 8 });
    const result = await service().updateStock(PRODUCT_ID, { delta: 3 });
    expect(result).toEqual({ id: PRODUCT_ID, quantity: 8 });
  });
});
