import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CheckoutInterface from "@/components/checkout-interface"

export default async function CheckoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's cart items with product details
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        description,
        price,
        category,
        images,
        stock_quantity,
        is_active,
        seller_id,
        profiles!products_seller_id_fkey(full_name)
      )
    `)
    .eq("user_id", user.id)

  // Filter only available items
  const availableItems = cartItems?.filter((item) => item.products.is_active && item.products.stock_quantity > 0) || []

  if (availableItems.length === 0) {
    redirect("/cart")
  }

  // Fetch user's addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  return <CheckoutInterface user={user} cartItems={availableItems} addresses={addresses || []} />
}
