"use client"

import type React from "react"

import { useState } from "react"
import { useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X } from "lucide-react"

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductAdded: () => void
  sellerId: string
}

export default function AddProductDialog({ open, onOpenChange, onProductAdded, sellerId }: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    fabric: "",
    color: "",
    size: "",
    care_instructions: "",
    stock_quantity: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("products").insert({
        seller_id: sellerId,
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        fabric: formData.fabric,
        color: formData.color,
        size: formData.size,
        care_instructions: formData.care_instructions,
        stock_quantity: Number.parseInt(formData.stock_quantity),
        images: images,
        is_active: true,
      })

      if (error) throw error

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        fabric: "",
        color: "",
        size: "",
        care_instructions: "",
        stock_quantity: "",
      })
      setImages([])

      onProductAdded()
      onOpenChange(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addImageUrl = () => {
    const url = prompt("Enter image URL (you can paste a Google Drive share link):")
    if (url && url.trim()) {
      const trimmed = url.trim()
      const normalized = normalizeDriveUrl(trimmed)
      setImages([...images, normalized])
    }
  }

  // File upload handlers (drag & drop + file picker)
  const handleFileInput = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          const url = await uploadFileToStorage(file)
          if (url) uploadedUrls.push(url)
        } catch (e) {
          // continue uploading others
          console.error('Upload failed for file', file.name, e)
        }
      }
      if (uploadedUrls.length > 0) setImages((prev) => [...prev, ...uploadedUrls])
    } finally {
      setUploading(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileInput(e.target.files)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileInput(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  async function uploadFileToStorage(file: File) {
    // bucket name used for product images
    const bucket = 'product-images'

    // generate a reasonably-unique path
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    // Upload
    const { data, error } = await supabase.storage.from(bucket).upload(filename, file)
    if (error) {
      throw error
    }

    // Get public URL
    const publicData = await supabase.storage.from(bucket).getPublicUrl(filename)
    // publicData shape: { data: { publicUrl } }
    // Depending on client version it may be data.publicUrl or data.public_url
    const publicUrl = (publicData as any)?.data?.publicUrl || (publicData as any)?.data?.public_url
    return publicUrl as string
  }

  // Convert common Google Drive sharing URLs into a direct image URL that can be embedded
  // Examples supported:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?export=download&id=FILE_ID
  function normalizeDriveUrl(input: string) {
    try {
      const url = new URL(input)

      // If already a drive 'uc' link or a direct URL, return as-is
      if (url.hostname.includes('googleusercontent.com') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.webp') || url.pathname.endsWith('.jpeg') ) {
        return input
      }

      if (url.hostname === 'drive.google.com') {
        // /file/d/FILE_ID/view
        const parts = url.pathname.split('/')
        const fileIndex = parts.indexOf('d')
        if (fileIndex !== -1 && parts[fileIndex + 1]) {
          const fileId = parts[fileIndex + 1]
          return `https://drive.google.com/uc?export=view&id=${fileId}`
        }

        // ?id=FILE_ID
        const id = url.searchParams.get('id')
        if (id) return `https://drive.google.com/uc?export=view&id=${id}`
      }

      // Fallback: return original input
      return input
    } catch (e) {
      return input
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Add New Product</DialogTitle>
          <DialogDescription>Add a new handcrafted product to your store</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Handwoven Silk Saree"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saree">Saree</SelectItem>
                  <SelectItem value="salwar">Salwar Kameez</SelectItem>
                  <SelectItem value="dupatta">Dupatta</SelectItem>
                  <SelectItem value="blouse">Blouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product, its craftsmanship, and unique features..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                required
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fabric">Fabric</Label>
              <Input
                id="fabric"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                placeholder="e.g., Pure Silk, Cotton"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g., Deep Red, Golden Yellow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., Free Size, S/M/L"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="care_instructions">Care Instructions</Label>
            <Textarea
              id="care_instructions"
              value={formData.care_instructions}
              onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
              placeholder="e.g., Dry clean only, Hand wash in cold water..."
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Product Images</Label>
              <Button type="button" variant="outline" onClick={addImageUrl} className="gap-2 bg-transparent">
                <Upload className="w-4 h-4" />
                Add Image URL
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">You can paste direct image URLs or a Google Drive share link. Drive links will be normalized automatically (make sure the file is shared publicly or "Anyone with the link can view").</p>

            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="border border-dashed rounded-md p-4 text-center bg-background/50"
            >
              <p className="text-sm text-muted-foreground mb-2">Drag & drop images here or use the file picker</p>
              <div className="flex items-center justify-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFileChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 bg-transparent">
                  <Upload className="w-4 h-4" />
                  Upload Images
                </Button>
                <Button type="button" variant="outline" onClick={addImageUrl} className="gap-2 bg-transparent">
                  <Upload className="w-4 h-4" />
                  Add Image URL
                </Button>
              </div>

              {uploading && <p className="text-xs text-muted-foreground mt-2">Uploading images...</p>}

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding Product..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
