'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ProductForm } from '@/features/inventory/components/ProductForm';
import { ProductFormData } from '@/shared/validators';
import api from '@/lib/api';

export default function AddProductModal() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      await api.post('/inventory/products', data);
      toast.success('Product added successfully!');
      router.back();
    } catch {
      toast.error('Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New Product</h2>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
