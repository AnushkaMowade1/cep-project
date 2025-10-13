import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ShopInterface from "@/components/shop-interface"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Martify - Authentic Indian Art & Handicrafts',
  description: 'Welcome to Martify - Your destination for authentic Indian art, traditional paintings, and handcrafted masterpieces. Support local artists and discover India\'s rich artistic heritage.',
}

export default async function HomePage() {
  const supabase = await createClient()
  
  // Fetch all products without authentication
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  // Create a mock user and profile for the shop interface
  const mockUser = null
  const mockProfile = null

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="warli-pattern py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-balance mb-4">Martify</h1>
          <p className="text-xl md:text-2xl text-muted-foreground text-pretty max-w-2xl mx-auto mb-8">
            {"Discover authentic handcrafted sarees and salwars made by talented Indian artisan women"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="font-medium">
              <Link href="#products">{"Browse Products"}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-medium border-2 bg-transparent">
              <Link href="/profile">{"Create Profile"}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="py-8">
        <ShopInterface 
          user={mockUser} 
          profile={mockProfile} 
          initialProducts={products || []} 
        />
      </div>
    </div>
  )
}
