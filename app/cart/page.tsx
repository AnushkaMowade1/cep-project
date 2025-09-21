import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CartInterface from "@/components/cart-interface"

export default async function CartPage() {
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
      created_at,
      updated_at,
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
    .order("created_at", { ascending: false })

  return <CartInterface user={user} initialCartItems={cartItems || []} />
}
