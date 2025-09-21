"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ShoppingCart, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ProductDetailModal from "@/components/product-detail-modal"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  images: string[]
  fabric: string
  color: string
  size: string
  care_instructions: string
  stock_quantity: number
  seller_id: string
  profiles: {
    full_name: string
  }
}

interface ShopInterfaceProps {
  user: any
  profile: any
  initialProducts: Product[]
}

export default function ShopInterface({ user, profile, initialProducts }: ShopInterfaceProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [cartItems, setCartItems] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, selectedCategory, priceRange, sortBy, products])

  const fetchUserData = async () => {
    // Fetch user's favorites
    const { data: favoritesData } = await supabase.from("favorites").select("product_id").eq("user_id", user.id)

    if (favoritesData) {
      setFavorites(new Set(favoritesData.map((f) => f.product_id)))
    }

    // Fetch user's cart items
    const { data: cartData } = await supabase.from("cart_items").select("product_id").eq("user_id", user.id)

    if (cartData) {
      setCartItems(new Set(cartData.map((c) => c.product_id)))
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.fabric?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.color?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number)
      if (max) {
        filtered = filtered.filter((product) => product.price >= min && product.price <= max)
      } else {
        filtered = filtered.filter((product) => product.price >= min)
      }
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default: // newest
        filtered.sort((a, b) => a.id.localeCompare(b.id)) // Sort by ID as fallback since created_at doesn't exist
    }

    setFilteredProducts(filtered)
  }

  const toggleFavorite = async (productId: string) => {
    const isFavorite = favorites.has(productId)

    if (isFavorite) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId)

      if (!error) {
        setFavorites((prev) => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
      }
    } else {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: productId,
      })

      if (!error) {
        setFavorites((prev) => new Set(prev).add(productId))
      }
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const categories = ["all", "saree", "salwar", "dupatta", "blouse"]
  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "0-1000", label: "Under ₹1,000" },
    { value: "1000-2500", label: "₹1,000 - ₹2,500" },
    { value: "2500-5000", label: "₹2,500 - ₹5,000" },
    { value: "5000", label: "Above ₹5,000" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-serif font-bold"><span className="text-red-800 italic" style={{fontFamily: "'AMS Aasmi', 'Noto Sans Devanagari', sans-serif", fontSize: '1.2em', textShadow: '1px 1px 2px rgba(0,0,0,0.1)', transform: 'skew(-3deg)', display: 'inline-block', fontWeight: 'bold'}}>कला</span> Bazaar</h1>
                <p className="text-sm text-muted-foreground">Handcrafted with love</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/cart" className="gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cartItems.size})
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/favorites" className="gap-2">
                  <Heart className="w-4 h-4" />
                  Favorites ({favorites.size})
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
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

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
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
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold">
              {searchQuery ? `Search results for "${searchQuery}"` : "All Products"}
            </h2>
            <p className="text-muted-foreground">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground text-center mb-4">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setPriceRange("all")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Search className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">No image</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant={favorites.has(product.id) ? "default" : "secondary"}
                      className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(product.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive" className="text-xs">
                        Only {product.stock_quantity} left
                      </Badge>
                    </div>
                  )}

                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3
                      className="font-semibold text-lg line-clamp-1 cursor-pointer hover:text-primary"
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>by {product.profiles?.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    {product.fabric && <p className="text-xs text-muted-foreground">Fabric: {product.fabric}</p>}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold">₹{product.price.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedProduct(product)}>
                          View Details
                        </Button>
                        {product.stock_quantity > 0 && !cartItems.has(product.id) && (
                          <Button size="sm" onClick={() => addToCart(product.id)}>
                            Add to Cart
                          </Button>
                        )}
                        {cartItems.has(product.id) && (
                          <Button size="sm" variant="secondary" disabled>
                            In Cart
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          user={user}
          isFavorite={favorites.has(selectedProduct.id)}
          isInCart={cartItems.has(selectedProduct.id)}
          onToggleFavorite={() => toggleFavorite(selectedProduct.id)}
          onAddToCart={() => addToCart(selectedProduct.id)}
        />
      )}
    </div>
  )
}
