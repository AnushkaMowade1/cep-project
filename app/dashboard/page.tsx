import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import BuyerDashboard from "@/components/buyer-dashboard"
import SellerDashboard from "@/components/seller-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to determine user type
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    // Create profile if it doesn't exist
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || "",
      phone: user.user_metadata?.phone || "",
      user_type: user.user_metadata?.user_type || "buyer",
    })

    if (error) {
      console.error("Error creating profile:", error)
    }

    // Redirect to refresh with new profile
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {profile.user_type === "seller" ? (
        <SellerDashboard user={user} profile={profile} />
      ) : (
        <BuyerDashboard user={user} profile={profile} />
      )}
    </div>
  )
}
