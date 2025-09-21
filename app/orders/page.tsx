import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OrdersInterface from "@/components/orders-interface"

export default async function OrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's orders with order items
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          images,
          profiles!products_seller_id_fkey(full_name)
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <OrdersInterface user={user} initialOrders={orders || []} />
}
