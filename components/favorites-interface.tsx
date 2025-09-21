"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ShoppingCart, ArrowLeft, Trash2, Search } from "lucide-react"
import Link from "next/link"

interface Favorite {
  id: string
  created_at: string
  products: {
    id: string
    name: string
    description: string
    price: number
    category: string
    images: string[]
    stock_quantity: number
    is_active: boolean
    profiles: {
      full_name: string
    }
  }
}

interface FavoritesInterfaceProps {
  user: any
  initialFavorites: Favorite[]
}

export default function FavoritesInterface({ user, initialFavorites }: FavoritesInterfaceProps) {
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites)
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>(initialFavorites)
  const [cartItems, setCartItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const supabase = createClient()

  useEffect(() => {
    fetchCartItems()
  }, [])

  useEffect(() => {
    filterFavorites()
  }, [searchQuery, selectedCategory, sortBy, favorites])

  const fetchCartItems = async () => {
    const { data: cartData } = await supabase.from("cart_items").select("product_id").eq("user_id", user.id)

    if (cartData) {
      setCartItems(new Set(cartData.map((c) => c.product_id)))
    }
  }

  const filterFavorites = () => {
    let filtered = [...favorites]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (favorite) =>
          favorite.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          favorite.products.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((favorite) => favorite.products.category === selectedCategory)
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.products.price - b.products.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.products.price - a.products.price)
        break
      case "name":
        filtered.sort((a, b) => a.products.name.localeCompare(b.products.name))
        break
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    setFilteredFavorites(filtered)
  }

  const removeFavorite = async (favoriteId: string, productId: string) => {
    const { error } = await supabase.from("favorites").delete().eq("id", favoriteId)

    if (!error) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId))
    }
  }

  const addToCart = async (productId: string) => {
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity: 1,
    })

    if (!error) {
      setCartItems((prev) => new Set(prev).add(productId))
    }
  }

  const addAllToCart = async () => {
    const availableItems = filteredFavorites.filter(
      (fav) => fav.products.is_active && fav.products.stock_quantity > 0 && !cartItems.has(fav.products.id),
    )

    if (availableItems.length === 0) return

    const cartInserts = availableItems.map((fav) => ({
      user_id: user.id,
      product_id: fav.products.id,
      quantity: 1,
    }))

    const { error } = await supabase.from("cart_items").insert(cartInserts)

    if (!error) {
      const newCartItems = new Set(cartItems)
      availableItems.forEach((fav) => newCartItems.add(fav.products.id))
      setCartItems(newCartItems)
    }
  }

  const clearAllFavorites = async () => {
    if (confirm("Are you sure you want to clear all favorites?")) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id)

      if (!error) {
        setFavorites([])
      }
    }
  }

  const categories = ["all", "saree", "salwar", "dupatta", "blouse"]
  const availableItemsCount = filteredFavorites.filter(
    (fav) => fav.products.is_active && fav.products.stock_quantity > 0 && !cartItems.has(fav.products.id),
  ).length

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
                  Back to Shop
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-serif font-bold">My Favorites</h1>
                <p className="text-muted-foreground">Your saved products</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="/cart" className="gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cartItems.size})
                </Link>
              </Button>
              {favorites.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFavorites}
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground text-center mb-4">Start browsing and save products you love</p>
              <Button asChild>
                <Link href="/shop">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="bg-card rounded-lg border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search favorites..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>

                {availableItemsCount > 0 && (
                  <Button onClick={addAllToCart} className="gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Add All to Cart ({availableItemsCount})
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {filteredFavorites.length} Favorite{filteredFavorites.length !== 1 ? "s" : ""}
                  {searchQuery && ` for "${searchQuery}"`}
                </h2>
              </div>
            </div>

            {filteredFavorites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No favorites found</h3>
                  <p className="text-muted-foreground text-center mb-4">Try adjusting your search or filter criteria</p>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((favorite) => {
                  const product = favorite.products
                  const isAvailable = product.is_active && product.stock_quantity > 0
                  const isInCart = cartItems.has(product.id)

                  return (
                    <Card key={favorite.id} className="overflow-hidden group">
                      <div className="aspect-square bg-muted relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFavorite(favorite.id, product.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive">
                              {!product.is_active ? "No longer available" : "Out of Stock"}
                            </Badge>
                          </div>
                        )}

                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="destructive" className="text-xs">
                              Only {product.stock_quantity} left
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>by {product.profiles?.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xl font-bold">₹{product.price.toLocaleString()}</span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFavorite(favorite.id, product.id)}
                                className="gap-1"
                              >
                                <Heart className="w-3 h-3 fill-current" />
                                Remove
                              </Button>
                              {isAvailable && !isInCart && (
                                <Button size="sm" onClick={() => addToCart(product.id)} className="gap-1">
                                  <ShoppingCart className="w-3 h-3" />
                                  Add to Cart
                                </Button>
                              )}
                              {isInCart && (
                                <Button size="sm" variant="secondary" disabled>
                                  In Cart
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
