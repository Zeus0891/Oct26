'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { TransactionForm } from '@/features/finance/components/TransactionForm';
import { TransactionFormData } from '@/shared/validators';
import api from '@/lib/api';

export default function AddTransactionModal() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      await api.post('/finance/transactions', data);
      toast.success('Transaction added successfully!');
      router.back();
    } catch {
      toast.error('Failed to add transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New Transaction</h2>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <TransactionForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
