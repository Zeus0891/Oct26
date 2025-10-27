import api from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export const inventoryService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get('/inventory/products');
    return response.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/inventory/products/${id}`);
    return response.data;
  },

  async createProduct(product: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await api.post('/inventory/products', product);
    return response.data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await api.put(`/inventory/products/${id}`, product);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/inventory/products/${id}`);
  },

  async updateStock(id: string, quantity: number): Promise<Product> {
    const response = await api.patch(`/inventory/products/${id}/stock`, { quantity });
    return response.data;
  },
};
