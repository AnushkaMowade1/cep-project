"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, ShoppingCart, Package, Truck, Shield, ArrowLeft, ArrowRight } from "lucide-react"

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

interface ProductDetailModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  user: any
  isFavorite: boolean
  isInCart: boolean
  onToggleFavorite: () => void
  onAddToCart: () => void
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  user,
  isFavorite,
  isInCart,
  onToggleFavorite,
  onAddToCart,
}: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const nextImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const hasImages = product.images && product.images.length > 0
  const currentImage = hasImages ? product.images[currentImageIndex] : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              {currentImage ? (
                <img
                  src={currentImage || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                </div>
              )}

              {hasImages && product.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {hasImages && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      index === currentImageIndex ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-serif font-bold text-balance">{product.name}</h1>
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleFavorite}
                  className="ml-4"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
              </div>
              <p className="text-3xl font-bold text-primary mb-2">₹{product.price.toLocaleString()}</p>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{product.category}</Badge>
                <span className="text-sm text-muted-foreground">by {product.profiles?.full_name}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.fabric && (
                <div>
                  <span className="font-medium">Fabric:</span>
                  <p className="text-muted-foreground">{product.fabric}</p>
                </div>
              )}
              {product.color && (
                <div>
                  <span className="font-medium">Color:</span>
                  <p className="text-muted-foreground">{product.color}</p>
                </div>
              )}
              {product.size && (
                <div>
                  <span className="font-medium">Size:</span>
                  <p className="text-muted-foreground">{product.size}</p>
                </div>
              )}
              <div>
                <span className="font-medium">Stock:</span>
                <p className={`${product.stock_quantity <= 5 ? "text-destructive" : "text-muted-foreground"}`}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Out of stock"}
                </p>
              </div>
            </div>

            {product.care_instructions && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Care Instructions</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{product.care_instructions}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              {product.stock_quantity > 0 ? (
                <div className="flex gap-3">
                  {!isInCart ? (
                    <Button onClick={onAddToCart} className="flex-1 gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  ) : (
                    <Button variant="secondary" disabled className="flex-1 gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      In Cart
                    </Button>
                  )}
                  <Button variant="outline" onClick={onToggleFavorite} className="gap-2 bg-transparent">
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    {isFavorite ? "Saved" : "Save"}
                  </Button>
                </div>
              ) : (
                <Button disabled className="w-full">
                  Out of Stock
                </Button>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Authentic</p>
              </div>
              <div className="text-center">
                <Package className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Handcrafted</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
