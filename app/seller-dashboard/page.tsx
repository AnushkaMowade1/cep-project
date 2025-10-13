"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Package, Plus, Edit2, Trash2, ArrowLeft, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AddProductDialog from "@/components/add-product-dialog"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  fabric?: string
  color?: string
  size?: string
  stock_quantity: number
  seller_id: string
  created_at: string
}

interface Profile {
  id: string
  full_name: string
  email: string
  is_seller: boolean
  user_type: string
}

export default function SellerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
  })
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkSellerAccess()
  }, [])

  const checkSellerAccess = async () => {
    setIsLoading(true)
    try {
      // Check if user is authenticated and is a seller
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/profile")
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (!profileData || !profileData.is_seller) {
        router.push("/profile")
        return
      }

      setProfile(profileData)
      await fetchSellerData(user.id)
    } catch (error) {
      console.error("Error checking seller access:", error)
      router.push("/profile")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSellerData = async (sellerId: string) => {
    try {
      // Fetch seller's products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })

      if (productsData) {
        setProducts(productsData)
        
        // Calculate stats
        const totalRevenue = productsData.reduce((sum, product) => sum + (product.price * (10 - product.stock_quantity)), 0) // Assuming sold = initial stock - current stock
        setStats({
          totalProducts: productsData.length,
          totalRevenue,
          totalOrders: 0, // Would need orders table to calculate this
        })
      }
    } catch (error) {
      console.error("Error fetching seller data:", error)
      setError("Failed to load seller data")
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)

      if (error) throw error

      setProducts(products.filter(p => p.id !== productId))
      setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }))
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowAddProduct(true)
  }

  const handleProductAdded = async () => {
    if (profile) {
      await fetchSellerData(profile.id)
      setShowAddProduct(false)
      setEditingProduct(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading seller dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Access denied. Please ensure you have a seller account.</p>
          <Button asChild className="mt-4">
            <Link href="/profile">Go to Profile</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-serif font-bold flex items-center gap-2">
                  <Store className="h-6 w-6" />
                  Seller Dashboard
                </h1>
                <p className="text-muted-foreground">Welcome, {profile.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Estimated earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Total orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>
                  Manage your product listings and inventory
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start selling by adding your first product
                </p>
                <Button onClick={() => setShowAddProduct(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="relative">
                    <CardContent className="p-4">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      )}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">₹{product.price.toLocaleString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Stock: {product.stock_quantity}</span>
                          {product.color && <span>Color: {product.color}</span>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Product Dialog */}
      {showAddProduct && profile && (
        <AddProductDialog
          open={showAddProduct}
          onOpenChange={setShowAddProduct}
          onProductAdded={handleProductAdded}
          sellerId={profile.id}
        />
      )}
    </div>
  )
}