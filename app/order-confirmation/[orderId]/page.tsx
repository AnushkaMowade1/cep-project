import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OrderConfirmation from "@/components/order-confirmation"

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch order details
  const { data: order } = await supabase
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
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    redirect("/dashboard")
  }

  return <OrderConfirmation order={order} />
}
