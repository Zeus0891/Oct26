import { useState, useEffect } from 'react';
import { financeService, Transaction, FinanceStats } from '../services/financeService';

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await financeService.getTransactions();
      setTransactions(data);
    } catch {
      setError('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await financeService.getStats();
      setStats(data);
    } catch {
      setError('Failed to fetch finance stats');
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'status'>) => {
    try {
      const newTransaction = await financeService.createTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      await fetchStats(); // Refresh stats
      return newTransaction;
    } catch {
      throw new Error('Failed to add transaction');
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await financeService.updateTransaction(id, updates);
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      await fetchStats(); // Refresh stats
      return updatedTransaction;
    } catch {
      throw new Error('Failed to update transaction');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await financeService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      await fetchStats(); // Refresh stats
    } catch {
      throw new Error('Failed to delete transaction');
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  return {
    transactions,
    stats,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: () => {
      fetchTransactions();
      fetchStats();
    },
  };
}
