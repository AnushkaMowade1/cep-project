import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ShopInterface from "@/components/shop-interface"

export default async function ShopPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch all active products
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey(full_name)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return <ShopInterface user={user} profile={profile} initialProducts={products || []} />
}
