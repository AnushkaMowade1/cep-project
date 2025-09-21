"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Package, ArrowLeft, Eye, X, Truck, CheckCircle, Clock, MapPin, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  total_amount: number
  status: string
  payment_method: string
  payment_status: string
  created_at: string
  shipping_full_name: string
  shipping_phone: string
  shipping_address_line_1: string
  shipping_address_line_2: string
  shipping_city: string
  shipping_state: string
  shipping_pin_code: string
  notes: string
  order_items: Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    product_name: string
    product_description: string
    product_image: string
    products: {
      name: string
      images: string[]
      profiles: {
        full_name: string
      }
    }
  }>
}

interface OrdersInterfaceProps {
  user: any
  initialOrders: Order[]
}

export default function OrdersInterface({ user, initialOrders }: OrdersInterfaceProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <X className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
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

  const canCancelOrder = (order: Order) => {
    return (
      order.status === "processing" && new Date().getTime() - new Date(order.created_at).getTime() < 24 * 60 * 60 * 1000
    ) // 24 hours
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return

    setIsLoading(true)
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId)

    if (!error) {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "cancelled" } : order)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: "cancelled" })
      }
    }
    setIsLoading(false)
  }

  const filterOrders = (status: string) => {
    if (status === "all") return orders
    return orders.filter((order) => order.status === status)
  }

  const activeOrders = filterOrders("processing").concat(filterOrders("shipped"))
  const completedOrders = filterOrders("delivered")
  const cancelledOrders = filterOrders("cancelled")

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString()} • {order.order_items.length} item
              {order.order_items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">₹{Number(order.total_amount).toLocaleString()}</p>
            <Badge variant={getStatusColor(order.status)} className="gap-1">
              {getStatusIcon(order.status)}
              {order.status}
            </Badge>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          {order.order_items.slice(0, 3).map((item, index) => (
            <div key={index} className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
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
          ))}
          {order.order_items.length > 3 && (
            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs font-medium">
              +{order.order_items.length - 3}
            </div>
          )}
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
                  <Badge variant={getStatusColor(order.status)} className="gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Order Date</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
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
                          <p className="text-xs text-muted-foreground">by {item.products?.profiles?.full_name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                            <span className="text-sm font-semibold">₹{Number(item.total_price).toLocaleString()}</span>
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
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        ₹{(Number(order.total_amount) - (Number(order.total_amount) > 2000 ? 0 : 100)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{Number(order.total_amount) > 2000 ? "Free" : "₹100"}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{Number(order.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canCancelOrder(order) && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={() => cancelOrder(order.id)}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel Order
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Orders can be cancelled within 24 hours of placement
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {canCancelOrder(order) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => cancelOrder(order.id)}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold">My Orders</h1>
              <p className="text-muted-foreground">Track and manage your orders</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground text-center mb-4">Start shopping to see your orders here</p>
              <Button asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {activeOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Clock className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No active orders</p>
                  </CardContent>
                </Card>
              ) : (
                activeOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <CheckCircle className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No completed orders</p>
                  </CardContent>
                </Card>
              ) : (
                completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <X className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No cancelled orders</p>
                  </CardContent>
                </Card>
              ) : (
                cancelledOrders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
