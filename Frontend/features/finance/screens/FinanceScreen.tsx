'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import api from '@/lib/api'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  status: 'completed' | 'pending' | 'failed'
}

interface FinanceStats {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  monthlyGrowth: number
}

export function FinanceScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<FinanceStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyGrowth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const [transactionsRes, statsRes] = await Promise.all([
          api.get('/finance/transactions'),
          api.get('/finance/stats'),
        ])
        setTransactions(transactionsRes.data)
        setStats(statsRes.data)
      } catch (error) {
        console.error('Error fetching finance data:', error)
        // Initialize with empty data for production
        setStats({
          totalIncome: 0,
          totalExpenses: 0,
          netProfit: 0,
          monthlyGrowth: 0,
        })
        setTransactions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinanceData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="neomorphic-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Finance
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your financial performance
              </p>
            </div>
          </div>
          <Link href="/modals/finance/add-transaction">
            <Button className="neomorphic-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neomorphic-stats p-6 group cursor-pointer border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${stats.totalIncome.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Total Income
          </div>
        </div>

        <div className="neomorphic-stats p-6 group cursor-pointer border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                ${stats.totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </div>
        </div>

        <div className="neomorphic-stats p-6 group cursor-pointer border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ${stats.netProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Net Profit
          </div>
        </div>

        <div className="neomorphic-stats p-6 group cursor-pointer border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 neomorphic-button flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                +{stats.monthlyGrowth}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs last month
              </p>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Monthly Growth
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="neomorphic-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Recent Transactions
            </h3>
            <p className="text-sm text-muted-foreground">
              Latest financial transactions
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No transactions found
              </h3>
              <p className="text-muted-foreground mb-6">
                Start by adding your first transaction
              </p>
              <Link href="/modals/finance/add-transaction">
                <Button className="neomorphic-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </Link>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="neomorphic-button p-4 hover:scale-[1.01] transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 neomorphic-button flex items-center justify-center ${
                        transaction.type === 'income'
                          ? 'border-l-4 border-green-500'
                          : 'border-l-4 border-red-500'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}$
                        {transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
                      >
                        {transaction.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="neomorphic-button"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
