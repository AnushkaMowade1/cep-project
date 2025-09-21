"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Heart, Package, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Order {
  id: string
  order_number: string
  total_amount: number
  status: string
  created_at: string
  order_items: {
    product_name: string
    quantity: number
    unit_price: number
  }[]
}

export default function BuyerDashboard({ user, profile }: { user: any; profile: any }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteItems: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)

    // Fetch orders
    const { data: ordersData } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        order_items(
          product_name,
          quantity,
          unit_price
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Fetch favorites count
    const { count: favoritesCount } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (ordersData) {
      setOrders(ordersData)
      const totalSpent = ordersData.reduce((sum, order) => sum + Number(order.total_amount), 0)
      setStats({
        totalOrders: ordersData.length,
        totalSpent,
        favoriteItems: favoritesCount || 0,
      })
    }

    setIsLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
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
              <h1 className="text-2xl font-serif font-bold">Welcome to <span className="text-red-800 italic" style={{fontFamily: "'AMS Aasmi', 'Noto Sans Devanagari', sans-serif", fontSize: '1.1em', textShadow: '1px 1px 2px rgba(0,0,0,0.1)', transform: 'skew(-3deg)', display: 'inline-block', fontWeight: 'bold'}}>कला</span> Bazaar</h1>
              <p className="text-muted-foreground">Hello, {profile.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link href="/shop">Browse Products</Link>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Supporting artisans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Items</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoriteItems}</div>
              <p className="text-xs text-muted-foreground">Saved for later</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild className="h-auto p-6 flex-col gap-2">
            <Link href="/shop">
              <ShoppingBag className="w-6 h-6" />
              <span>Browse Products</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-6 flex-col gap-2 bg-transparent">
            <Link href="/cart">
              <Package className="w-6 h-6" />
              <span>View Cart</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-6 flex-col gap-2 bg-transparent">
            <Link href="/favorites">
              <Heart className="w-6 h-6" />
              <span>Favorites</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-6 flex-col gap-2 bg-transparent">
            <Link href="/profile">
              <User className="w-6 h-6" />
              <span>Profile</span>
            </Link>
          </Button>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your recent purchases from <span className="text-red-800 font-medium italic" style={{fontFamily: "'AMS Aasmi', 'Noto Sans Devanagari', sans-serif", fontSize: '1.05em', textShadow: '1px 1px 2px rgba(0,0,0,0.1)', transform: 'skew(-2deg)', display: 'inline-block', fontWeight: 'bold'}}>कला</span> Bazaar</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                <Button asChild>
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Order #{order.order_number}</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.order_items.length} item(s) • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{Number(order.total_amount).toLocaleString()}</p>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "default"
                            : order.status === "shipped"
                              ? "secondary"
                              : order.status === "processing"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {orders.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/orders">View All Orders</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
