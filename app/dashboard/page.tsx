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
  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    // Try to create profile if it doesn't exist. If this fails (schema mismatch, RLS, etc.)
    // we fall back to an in-memory profile so the user can still access the dashboard.
    try {
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
        phone: user.user_metadata?.phone || "",
        user_type: user.user_metadata?.user_type || "buyer",
      })

      if (error) {
        // Log and fall through to fallback behavior
        console.error("Error creating profile:", error)
        // fallback to a temporary profile below
      } else {
        // If insert succeeded, fetch the inserted profile so we render with DB values
        const { data: newProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (newProfile) profile = newProfile
      }
    } catch (err) {
      console.error("Exception while creating profile:", err)
    }

    // If profile still falsy (insert failed), create a minimal in-memory profile object
    if (!profile) {
      profile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "",
        phone: user.user_metadata?.phone || "",
        user_type: user.user_metadata?.user_type || "buyer",
      }
      // We intentionally do NOT redirect; render dashboard with fallback profile
    }
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
