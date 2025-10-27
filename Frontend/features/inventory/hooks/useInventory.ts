import { useState, useEffect } from 'react';
import { inventoryService, Product } from '../services/inventoryService';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getProducts();
      setProducts(data);
    } catch {
      setError('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = await inventoryService.createProduct(product);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch {
      throw new Error('Failed to add product');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await inventoryService.updateProduct(id, updates);
      setProducts(prev => 
        prev.map(p => p.id === id ? updatedProduct : p)
      );
      return updatedProduct;
    } catch {
      throw new Error('Failed to update product');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await inventoryService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      throw new Error('Failed to delete product');
    }
  };

  const updateStock = async (id: string, quantity: number) => {
    try {
      const updatedProduct = await inventoryService.updateStock(id, quantity);
      setProducts(prev => 
        prev.map(p => p.id === id ? updatedProduct : p)
      );
      return updatedProduct;
    } catch {
      throw new Error('Failed to update stock');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refetch: fetchProducts,
  };
}
