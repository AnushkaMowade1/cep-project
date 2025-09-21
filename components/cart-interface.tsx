"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, Heart, CreditCard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  quantity: number
  created_at: string
  updated_at: string
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

interface CartInterfaceProps {
  user: any
  initialCartItems: CartItem[]
}

export default function CartInterface({ user, initialCartItems }: CartInterfaceProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
  const [isUpdating, setIsUpdating] = useState<Set<string>>(new Set())
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    const { data: favoritesData } = await supabase.from("favorites").select("product_id").eq("user_id", user.id)

    if (favoritesData) {
      setFavorites(new Set(favoritesData.map((f) => f.product_id)))
    }
  }

  const updateQuantity = async (cartItemId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity < 1 || newQuantity > maxStock) return

    setIsUpdating((prev) => new Set(prev).add(cartItemId))

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq("id", cartItemId)

    if (!error) {
      setCartItems((prev) => prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item)))
    }

    setIsUpdating((prev) => {
      const newSet = new Set(prev)
      newSet.delete(cartItemId)
      return newSet
    })
  }

  const removeItem = async (cartItemId: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

    if (!error) {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId))
    }
  }

  const moveToFavorites = async (cartItemId: string, productId: string) => {
    // Add to favorites if not already there
    if (!favorites.has(productId)) {
      const { error: favoriteError } = await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: productId,
      })

      if (!favoriteError) {
        setFavorites((prev) => new Set(prev).add(productId))
      }
    }

    // Remove from cart
    await removeItem(cartItemId)
  }

  const clearCart = async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id)

      if (!error) {
        setCartItems([])
      }
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    if (item.products.is_active && item.products.stock_quantity > 0) {
      return sum + item.products.price * item.quantity
    }
    return sum
  }, 0)

  const shipping = subtotal > 2000 ? 0 : 100 // Free shipping over ₹2000
  const total = subtotal + shipping

  const activeItems = cartItems.filter((item) => item.products.is_active && item.products.stock_quantity > 0)
  const unavailableItems = cartItems.filter((item) => !item.products.is_active || item.products.stock_quantity === 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/shop">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-serif font-bold">Shopping Cart</h1>
                <p className="text-muted-foreground">
                  {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
                </p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                Clear Cart
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add some beautiful handcrafted items to get started
              </p>
              <Button asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Available Items */}
              {activeItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Available Items ({activeItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeItems.map((item) => {
                      const product = item.products
                      const isUpdatingThis = isUpdating.has(item.id)

                      return (
                        <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                          <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">by {product.profiles?.full_name}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {product.category}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">₹{product.price.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">each</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1, product.stock_quantity)}
                                  disabled={item.quantity <= 1 || isUpdatingThis}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1, product.stock_quantity)}
                                  disabled={item.quantity >= product.stock_quantity || isUpdatingThis}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {product.stock_quantity} available
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveToFavorites(item.id, product.id)}
                                  className="gap-1"
                                >
                                  <Heart className="w-3 h-3" />
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-destructive hover:text-destructive gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remove
                                </Button>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-semibold text-lg">
                                ₹{(product.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Unavailable Items */}
              {unavailableItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">Unavailable Items ({unavailableItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {unavailableItems.map((item) => {
                      const product = item.products

                      return (
                        <div key={item.id} className="flex gap-4 p-4 border rounded-lg opacity-60">
                          <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0 relative">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="destructive" className="text-xs">
                                {!product.is_active ? "Unavailable" : "Out of Stock"}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">by {product.profiles?.full_name}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {product.category}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold line-through">₹{product.price.toLocaleString()}</p>
                                <p className="text-sm text-destructive">
                                  {!product.is_active ? "No longer available" : "Out of stock"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Quantity: {item.quantity}</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveToFavorites(item.id, product.id)}
                                  className="gap-1"
                                >
                                  <Heart className="w-3 h-3" />
                                  Save for Later
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-destructive hover:text-destructive gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            {activeItems.length > 0 && (
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal ({activeItems.length} items)</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                      </div>
                      {shipping === 0 && subtotal > 0 && (
                        <p className="text-xs text-green-600">Free shipping on orders over ₹2,000!</p>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>

                    <Button asChild className="w-full gap-2" size="lg">
                      <Link href="/checkout">
                        <CreditCard className="w-4 h-4" />
                        Proceed to Checkout
                      </Link>
                    </Button>

                    <div className="text-center">
                      <Button variant="outline" asChild className="w-full bg-transparent">
                        <Link href="/shop">Continue Shopping</Link>
                      </Button>
                    </div>

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
                        <span>Supporting artisan women</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span>Authentic handcrafted products</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
