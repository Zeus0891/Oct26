import api from "@/lib/api";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  monthlyGrowth: number;
}

export const financeService = {
  async getTransactions(): Promise<Transaction[]> {
    const response = await api.get("/api/finance/transactions");
    return response.data;
  },

  async getStats(): Promise<FinanceStats> {
    const response = await api.get("/api/finance/stats");
    return response.data;
  },

  async createTransaction(
    transaction: Omit<Transaction, "id" | "status">
  ): Promise<Transaction> {
    const response = await api.post("/api/finance/transactions", transaction);
    return response.data;
  },

  async updateTransaction(
    id: string,
    transaction: Partial<Transaction>
  ): Promise<Transaction> {
    const response = await api.put(`/finance/transactions/${id}`, transaction);
    return response.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/finance/transactions/${id}`);
  },
};
