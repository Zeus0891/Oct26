'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Package } from 'lucide-react'
import api from '@/lib/api'

interface Product {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  category: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/inventory/products')
        setProducts(response.data)
      } catch (error) {
        console.error('Error fetching inventory data:', error)
        // Initialize with empty data for production
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800'
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock':
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
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Inventory
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your product inventory
              </p>
            </div>
          </div>
          <Link href="/modals/inventory/add-product">
            <Button className="neomorphic-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="neomorphic-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Search Products
            </h3>
            <p className="text-sm text-muted-foreground">
              Find products by name or SKU
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neomorphic-input pl-12 h-12 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="neomorphic-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 neomorphic-button flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Products
              </h3>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} products found
              </p>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 neomorphic-button rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Start by adding your first product'}
            </p>
            {!searchTerm && (
              <Link href="/modals/inventory/add-product">
                <Button className="neomorphic-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="neomorphic-button p-6 hover:scale-[1.02] transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 neomorphic-button flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}
                  >
                    {product.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Category
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Quantity
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        product.quantity > 20
                          ? 'text-green-600'
                          : product.quantity > 5
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {product.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="text-lg font-bold text-primary">
                      ${product.price}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full neomorphic-button"
                  >
                    Edit Product
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
