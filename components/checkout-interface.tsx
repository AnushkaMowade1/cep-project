"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, MapPin, CreditCard, Plus, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  quantity: number
  products: {
    id: string
    name: string
    description: string
    price: number
    category: string
    images: string[]
    stock_quantity: number
    is_active: boolean
    seller_id: string
    profiles: {
      full_name: string
    }
  }
}

interface Address {
  id: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  pin_code: string
  is_default: boolean
}

interface CheckoutInterfaceProps {
  user: any
  cartItems: CartItem[]
  addresses: Address[]
}

export default function CheckoutInterface({ user, cartItems, addresses }: CheckoutInterfaceProps) {
  const [selectedAddress, setSelectedAddress] = useState<string>(
    addresses.find((addr) => addr.is_default)?.id || addresses[0]?.id || "",
  )
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    pin_code: "",
    is_default: false,
  })
  const [orderNotes, setOrderNotes] = useState("")

  const router = useRouter()
  const supabase = createClient()

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 100
  const total = subtotal + shipping

  const addNewAddress = async () => {
    if (
      !newAddress.full_name ||
      !newAddress.phone ||
      !newAddress.address_line_1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pin_code
    ) {
      alert("Please fill in all required fields")
      return
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        ...newAddress,
      })
      .select()
      .single()

    if (!error && data) {
      // If this is set as default, update other addresses
      if (newAddress.is_default) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id).neq("id", data.id)
      }

      setSelectedAddress(data.id)
      setIsAddingAddress(false)
      setNewAddress({
        full_name: "",
        phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        pin_code: "",
        is_default: false,
      })

      // Refresh the page to get updated addresses
      window.location.reload()
    }
  }

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `KB${timestamp}${random}`
  }

  const placeOrder = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address")
      return
    }

    setIsProcessing(true)

    try {
      const selectedAddr = addresses.find((addr) => addr.id === selectedAddress)
      if (!selectedAddr) {
        throw new Error("Selected address not found")
      }

      const orderNumber = generateOrderNumber()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: total,
          status: "processing",
          payment_method: paymentMethod,
          payment_status: paymentMethod === "cod" ? "pending" : "paid",
          shipping_full_name: selectedAddr.full_name,
          shipping_phone: selectedAddr.phone,
          shipping_address_line_1: selectedAddr.address_line_1,
          shipping_address_line_2: selectedAddr.address_line_2,
          shipping_city: selectedAddr.city,
          shipping_state: selectedAddr.state,
          shipping_pin_code: selectedAddr.pin_code,
          notes: orderNotes,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.products.id,
        seller_id: item.products.seller_id,
        quantity: item.quantity,
        unit_price: item.products.price,
        total_price: item.products.price * item.quantity,
        product_name: item.products.name,
        product_description: item.products.description,
        product_image: item.products.images[0] || null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Update product stock
      for (const item of cartItems) {
        await supabase
          .from("products")
          .update({
            stock_quantity: item.products.stock_quantity - item.quantity,
          })
          .eq("id", item.products.id)
      }

      // Clear cart
      await supabase.from("cart_items").delete().eq("user_id", user.id)

      // Redirect to order confirmation
      router.push(`/order-confirmation/${order.id}`)
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold">Checkout</h1>
              <p className="text-muted-foreground">Complete your order</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-6">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No addresses found</h3>
                    <p className="text-muted-foreground mb-4">Add a delivery address to continue</p>
                    <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="full_name">Full Name *</Label>
                              <Input
                                id="full_name"
                                value={newAddress.full_name}
                                onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone *</Label>
                              <Input
                                id="phone"
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="address_line_1">Address Line 1 *</Label>
                            <Input
                              id="address_line_1"
                              value={newAddress.address_line_1}
                              onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                              placeholder="House/Flat No., Street"
                            />
                          </div>
                          <div>
                            <Label htmlFor="address_line_2">Address Line 2</Label>
                            <Input
                              id="address_line_2"
                              value={newAddress.address_line_2}
                              onChange={(e) => setNewAddress({ ...newAddress, address_line_2: e.target.value })}
                              placeholder="Landmark, Area"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City *</Label>
                              <Input
                                id="city"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                placeholder="Mumbai"
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State *</Label>
                              <Input
                                id="state"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                placeholder="Maharashtra"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="pin_code">PIN Code *</Label>
                            <Input
                              id="pin_code"
                              value={newAddress.pin_code}
                              onChange={(e) => setNewAddress({ ...newAddress, pin_code: e.target.value })}
                              placeholder="400001"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="is_default"
                              checked={newAddress.is_default}
                              onCheckedChange={(checked) => setNewAddress({ ...newAddress, is_default: !!checked })}
                            />
                            <Label htmlFor="is_default">Set as default address</Label>
                          </div>
                          <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setIsAddingAddress(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button onClick={addNewAddress} className="flex-1">
                              Add Address
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Label htmlFor={address.id} className="font-semibold">
                                {address.full_name}
                              </Label>
                              {address.is_default && <Badge variant="secondary">Default</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.address_line_1}
                              {address.address_line_2 && `, ${address.address_line_2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} - {address.pin_code}
                            </p>
                            <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>

                    <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full gap-2 bg-transparent">
                          <Plus className="w-4 h-4" />
                          Add New Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="full_name">Full Name *</Label>
                              <Input
                                id="full_name"
                                value={newAddress.full_name}
                                onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone *</Label>
                              <Input
                                id="phone"
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="address_line_1">Address Line 1 *</Label>
                            <Input
                              id="address_line_1"
                              value={newAddress.address_line_1}
                              onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                              placeholder="House/Flat No., Street"
                            />
                          </div>
                          <div>
                            <Label htmlFor="address_line_2">Address Line 2</Label>
                            <Input
                              id="address_line_2"
                              value={newAddress.address_line_2}
                              onChange={(e) => setNewAddress({ ...newAddress, address_line_2: e.target.value })}
                              placeholder="Landmark, Area"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City *</Label>
                              <Input
                                id="city"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                placeholder="Mumbai"
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State *</Label>
                              <Input
                                id="state"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                placeholder="Maharashtra"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="pin_code">PIN Code *</Label>
                            <Input
                              id="pin_code"
                              value={newAddress.pin_code}
                              onChange={(e) => setNewAddress({ ...newAddress, pin_code: e.target.value })}
                              placeholder="400001"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="is_default"
                              checked={newAddress.is_default}
                              onCheckedChange={(checked) => setNewAddress({ ...newAddress, is_default: !!checked })}
                            />
                            <Label htmlFor="is_default">Set as default address</Label>
                          </div>
                          <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setIsAddingAddress(false)} className="flex-1">
                              Cancel
                            </Button>
                            <Button onClick={addNewAddress} className="flex-1">
                              Add Address
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <div className="flex-1">
                      <Label htmlFor="cod" className="font-semibold">
                        Cash on Delivery (COD)
                      </Label>
                      <p className="text-sm text-muted-foreground">Pay when your order is delivered</p>
                    </div>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg opacity-50">
                    <RadioGroupItem value="online" id="online" disabled />
                    <div className="flex-1">
                      <Label htmlFor="online" className="font-semibold">
                        Online Payment
                      </Label>
                      <p className="text-sm text-muted-foreground">Credit/Debit Card, UPI, Net Banking</p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for your order..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {item.products.images && item.products.images.length > 0 ? (
                          <img
                            src={item.products.images[0] || "/placeholder.svg"}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-primary/20 rounded"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{item.products.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold">
                          ₹{(item.products.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  {shipping === 0 && <p className="text-xs text-green-600">Free shipping on orders over ₹2,000!</p>}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <Button
                  onClick={placeOrder}
                  disabled={!selectedAddress || isProcessing}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Place Order
                    </>
                  )}
                </Button>

                {/* Trust Indicators */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>7-day return policy</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Supporting artisan women</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
