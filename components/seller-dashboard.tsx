"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Plus, Package, ShoppingBag, TrendingUp, Eye, Trash2, MapPin, Calendar, CreditCard } from "lucide-react"
import AddProductDialog from "@/components/add-product-dialog"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  stock_quantity: number
  is_active: boolean
  created_at: string
}

interface Order {
  id: string
  order_number: string
  total_amount: number
  status: string
  created_at: string
  shipping_full_name: string
  shipping_phone: string
  shipping_address_line_1: string
  shipping_address_line_2: string
  shipping_city: string
  shipping_state: string
  shipping_pin_code: string
  payment_method: string
  order_items: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    product_name: string
    product_description: string
    product_image: string
  }>
}

export default function SellerDashboard({ user, profile }: { user: any; profile: any }) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)

    // Fetch products
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })

    // Fetch orders for seller's products with order items
    const { data: ordersData } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        shipping_full_name,
        shipping_phone,
        shipping_address_line_1,
        shipping_address_line_2,
        shipping_city,
        shipping_state,
        shipping_pin_code,
        payment_method,
        order_items!inner(
          id,
          seller_id,
          quantity,
          unit_price,
          total_price,
          product_name,
          product_description,
          product_image
        )
      `)
      .eq("order_items.seller_id", user.id)
      .order("created_at", { ascending: false })

    if (productsData) {
      setProducts(productsData)
      const activeProducts = productsData.filter((p) => p.is_active).length
      setStats((prev) => ({
        ...prev,
        totalProducts: productsData.length,
        activeProducts,
      }))
    }

    if (ordersData) {
      setOrders(ordersData)
      const totalRevenue = ordersData.reduce((sum, order) => {
        const sellerItems = order.order_items.filter((item) => item.seller_id === user.id)
        return sum + sellerItems.reduce((itemSum, item) => itemSum + Number(item.total_price), 0)
      }, 0)
      setStats((prev) => ({
        ...prev,
        totalOrders: ordersData.length,
        totalRevenue,
      }))
    }

    setIsLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", productId)

    if (!error) {
      fetchData()
    }
  }

  const deleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (!error) {
        fetchData()
      }
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

    if (!error) {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "secondary"
      case "shipped":
        return "outline"
      case "delivered":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            <div>
              <h1 className="text-2xl font-serif font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsAddProductOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">{stats.activeProducts} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProducts}</div>
              <p className="text-xs text-muted-foreground">Currently visible</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Products</h2>
              <Button onClick={() => setIsAddProductOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {products.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by adding your first handcrafted product to the marketplace
                  </p>
                  <Button onClick={() => setIsAddProductOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted relative">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProductStatus(product.id, product.is_active)}
                          className="flex-1"
                        >
                          {product.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-xl font-semibold">Order Management</h2>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground text-center">Orders for your products will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                          <p className="text-sm text-muted-foreground">Customer: {order.shipping_full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()} • {order.order_items.length} item
                            {order.order_items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-lg font-bold">
                            ₹
                            {order.order_items
                              .reduce((sum, item) => sum + Number(item.total_price), 0)
                              .toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                            <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 bg-transparent"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center justify-between">
                                <span>Order #{order.order_number}</span>
                                <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                              </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Order Info */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">Order Date</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">Payment</p>
                                    <p className="text-xs text-muted-foreground">
                                      {order.payment_method === "cod" ? "Cash on Delivery" : "Online"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">Items</p>
                                    <p className="text-xs text-muted-foreground">
                                      {order.order_items.length} product{order.order_items.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              {/* Order Items */}
                              <div>
                                <h4 className="font-semibold mb-3">Order Items</h4>
                                <div className="space-y-3">
                                  {order.order_items.map((item) => (
                                    <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                                      <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                        {item.product_image ? (
                                          <img
                                            src={item.product_image || "/placeholder.svg"}
                                            alt={item.product_name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-4 h-4 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-medium text-sm">{item.product_name}</h5>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                          {item.product_description}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                          <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                                          <span className="text-sm font-semibold">
                                            ₹{Number(item.total_price).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Separator />

                              {/* Shipping Address */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  Shipping Address
                                </h4>
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <p className="font-medium">{order.shipping_full_name}</p>
                                  <p className="text-sm text-muted-foreground">{order.shipping_address_line_1}</p>
                                  {order.shipping_address_line_2 && (
                                    <p className="text-sm text-muted-foreground">{order.shipping_address_line_2}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    {order.shipping_city}, {order.shipping_state} - {order.shipping_pin_code}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Phone: {order.shipping_phone}</p>
                                </div>
                              </div>

                              <Separator />

                              {/* Order Total */}
                              <div>
                                <h4 className="font-semibold mb-3">Order Summary</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-lg font-semibold">
                                    <span>Your Earnings</span>
                                    <span>
                                      ₹
                                      {order.order_items
                                        .reduce((sum, item) => sum + Number(item.total_price), 0)
                                        .toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Update */}
                              <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-3">Update Order Status</h4>
                                <Select
                                  value={order.status}
                                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AddProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onProductAdded={fetchData}
        sellerId={user.id}
      />
    </div>
  )
}
