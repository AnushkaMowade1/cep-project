"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Store, Package } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    bio: "",
  })

  const supabase = createClient()

  useEffect(() => {
    checkUserAndProfile()
  }, [])

  const checkUserAndProfile = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setIsLoggedIn(true)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          setFormData({
            email: profileData.email || "",
            full_name: profileData.full_name || "",
            phone: profileData.phone || "",
            bio: profileData.bio || "",
          })
        }
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      if (!isLoggedIn) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: "temp123456",
          options: {
            data: {
              full_name: formData.full_name,
              phone: formData.phone,
            },
          },
        })

        if (signUpError) throw signUpError

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: formData.email,
              full_name: formData.full_name,
              phone: formData.phone,
              bio: formData.bio,
              user_type: "buyer",
              is_seller: false,
            })

          if (profileError) throw profileError

          setSuccess("Profile created successfully!")
          setShowCreateForm(false)
          await checkUserAndProfile()
        }
      } else {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            bio: formData.bio,
          })
          .eq("id", profile?.id)

        if (error) throw error

        setSuccess("Profile updated successfully!")
        setShowCreateForm(false)
        await checkUserAndProfile()
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBecomeSeller = async () => {
    if (!profile) return

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          user_type: "seller",
          is_seller: true,
        })
        .eq("id", profile.id)

      if (error) throw error

      setSuccess("Congratulations! You are now a seller.")
      await checkUserAndProfile()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        {!isLoggedIn || !profile ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Create Your Profile
              </CardTitle>
              <CardDescription>
                Create a profile to start shopping and interacting with our marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showCreateForm ? (
                <div className="text-center space-y-4">
                  <p>You need a profile to make purchases and interact with sellers.</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Profile
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Input
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                      {success}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Creating..." : "Create Profile"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-sm">{profile.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{profile.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm">{profile.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Type</Label>
                    <Badge variant={profile.is_seller ? "default" : "secondary"}>
                      {profile.is_seller ? "Seller" : "Buyer"}
                    </Badge>
                  </div>
                </div>
                
                {profile.bio && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(true)}>
                    Edit Profile
                  </Button>
                  {profile.is_seller && (
                    <Button asChild>
                      <Link href="/seller-dashboard">
                        <Store className="h-4 w-4 mr-2" />
                        Seller Dashboard
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {!profile.is_seller && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Become a Seller
                  </CardTitle>
                  <CardDescription>
                    Start selling your products on Martify.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">List Products</p>
                        <p className="text-muted-foreground">Add your handcrafted items</p>
                      </div>
                      <div className="text-center">
                        <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Manage Orders</p>
                        <p className="text-muted-foreground">Track and fulfill orders</p>
                      </div>
                      <div className="text-center">
                        <Store className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Grow Business</p>
                        <p className="text-muted-foreground">Reach more customers</p>
                      </div>
                    </div>
                    
                    <Button onClick={handleBecomeSeller} disabled={isSaving} className="w-full">
                      {isSaving ? "Processing..." : "Become a Seller"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                {success}
              </div>
            )}

            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
