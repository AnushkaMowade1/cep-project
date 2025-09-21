import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import FavoritesInterface from "@/components/favorites-interface"

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's favorites with product details
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      products (
        id,
        name,
        description,
        price,
        category,
        images,
        stock_quantity,
        is_active,
        profiles!products_seller_id_fkey(full_name)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <FavoritesInterface user={user} initialFavorites={favorites || []} />
}
