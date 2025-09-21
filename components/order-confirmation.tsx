"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Package, Truck, MapPin, CreditCard, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

interface OrderConfirmationProps {
  order: {
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
}

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7) // 7 days from now

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <h1 className="text-2xl font-serif font-bold">Order Confirmed!</h1>
            </div>
            <p className="text-muted-foreground">Thank you for your order. We'll send you updates via email.</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order #{order.order_number}</span>
                <Badge variant="secondary">{order.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Order Date</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-sm text-muted-foreground">
                      {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-sm text-muted-foreground">{estimatedDelivery.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.order_items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {item.product_image ? (
                        <img
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">by {item.products?.profiles?.full_name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="font-semibold">₹{Number(item.total_price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-semibold">{order.shipping_full_name}</p>
                  <p className="text-sm text-muted-foreground">{order.shipping_address_line_1}</p>
                  {order.shipping_address_line_2 && (
                    <p className="text-sm text-muted-foreground">{order.shipping_address_line_2}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {order.shipping_city}, {order.shipping_state} - {order.shipping_pin_code}
                  </p>
                  <p className="text-sm text-muted-foreground">Phone: {order.shipping_phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{Number(order.total_amount).toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                    Payment {order.payment_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-sm text-muted-foreground">We're preparing your handcrafted items with care</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Shipping</p>
                    <p className="text-sm text-muted-foreground">Your order will be shipped within 2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Estimated delivery by {estimatedDelivery.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="gap-2 bg-transparent">
              <Link href="/orders">
                View All Orders
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
