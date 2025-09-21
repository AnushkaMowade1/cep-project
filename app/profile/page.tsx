"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, MapPin, Settings, Shield, Plus, Edit2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  role: "buyer" | "seller"
  created_at: string
}

interface Address {
  id: string
  user_id: string
  type: "home" | "work" | "other"
  full_name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  pincode: string
  is_default: boolean
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/auth/login")
        return
      }

      // Fetch user profile
      const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      // Fetch user addresses
      const { data: userAddresses } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", authUser.id)
        .order("is_default", { ascending: false })

      setUser(profile)
      setAddresses(userAddresses || [])
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (formData: FormData) => {
    if (!user) return

    const fullName = formData.get("full_name") as string
    const phone = formData.get("phone") as string

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq("id", user.id)

      if (error) throw error

      setUser({ ...user, full_name: fullName, phone: phone })
      setEditingProfile(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const addAddress = async (formData: FormData) => {
    if (!user) return

    const addressData = {
      user_id: user.id,
      type: formData.get("type") as string,
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      address_line_1: formData.get("address_line_1") as string,
      address_line_2: formData.get("address_line_2") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      pincode: formData.get("pincode") as string,
      is_default: addresses.length === 0,
    }

    try {
      const { data, error } = await supabase.from("addresses").insert([addressData]).select().single()

      if (error) throw error

      setAddresses([...addresses, data])
      setAddingAddress(false)
    } catch (error) {
      console.error("Error adding address:", error)
    }
  }

  const updateAddress = async (addressId: string, formData: FormData) => {
    const addressData = {
      type: formData.get("type") as string,
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      address_line_1: formData.get("address_line_1") as string,
      address_line_2: formData.get("address_line_2") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      pincode: formData.get("pincode") as string,
    }

    try {
      const { error } = await supabase.from("addresses").update(addressData).eq("id", addressId)

      if (error) throw error

      setAddresses(addresses.map((addr) => (addr.id === addressId ? { ...addr, ...addressData } : addr)))
      setEditingAddress(null)
    } catch (error) {
      console.error("Error updating address:", error)
    }
  }

  const deleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase.from("addresses").delete().eq("id", addressId)

      if (error) throw error

      setAddresses(addresses.filter((addr) => addr.id !== addressId))
    } catch (error) {
      console.error("Error deleting address:", error)
    }
  }

  const setDefaultAddress = async (addressId: string) => {
    try {
      // Remove default from all addresses
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user?.id)

      // Set new default
      const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", addressId)

      if (error) throw error

      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        })),
      )
    } catch (error) {
      console.error("Error setting default address:", error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-800">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-orange-900 mb-2">My Profile</h1>
            <p className="text-orange-700">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-orange-900">Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                    <Badge
                      variant={user.role === "seller" ? "default" : "secondary"}
                      className="bg-orange-100 text-orange-800"
                    >
                      {user.role === "seller" ? "Seller" : "Buyer"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingProfile ? (
                    <form action={updateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input id="full_name" name="full_name" defaultValue={user.full_name || ""} required />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" name="phone" type="tel" defaultValue={user.phone || ""} required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" value={user.email} disabled className="bg-gray-50" />
                        <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                          Save Changes
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingProfile(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                          <p className="text-gray-900">{user.full_name || "Not provided"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                          <p className="text-gray-900">{user.phone || "Not provided"}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                        <p className="text-gray-900">
                          {new Date(user.created_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <Button onClick={() => setEditingProfile(true)} className="bg-orange-600 hover:bg-orange-700">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses">
              <div className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-orange-900">Saved Addresses</CardTitle>
                        <CardDescription>Manage your delivery addresses</CardDescription>
                      </div>
                      <Button onClick={() => setAddingAddress(true)} className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Address
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {addresses.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No addresses saved yet</p>
                        <p className="text-sm text-gray-500">Add an address to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div key={address.id} className="border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="capitalize">
                                    {address.type}
                                  </Badge>
                                  {address.is_default && <Badge className="bg-green-100 text-green-800">Default</Badge>}
                                </div>
                                <p className="font-medium text-gray-900">{address.full_name}</p>
                                <p className="text-sm text-gray-600">{address.phone}</p>
                                <p className="text-sm text-gray-700 mt-1">
                                  {address.address_line_1}
                                  {address.address_line_2 && `, ${address.address_line_2}`}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {!address.is_default && (
                                  <Button size="sm" variant="outline" onClick={() => setDefaultAddress(address.id)}>
                                    Set Default
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => setEditingAddress(address.id)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteAddress(address.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Add Address Form */}
                {addingAddress && (
                  <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-orange-900">Add New Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form action={addAddress} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Address Type</Label>
                            <Select name="type" defaultValue="home">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="home">Home</SelectItem>
                                <SelectItem value="work">Work</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" name="full_name" required />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" name="phone" type="tel" required />
                        </div>
                        <div>
                          <Label htmlFor="address_line_1">Address Line 1</Label>
                          <Input id="address_line_1" name="address_line_1" required />
                        </div>
                        <div>
                          <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
                          <Input id="address_line_2" name="address_line_2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" required />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input id="state" name="state" required />
                          </div>
                          <div>
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input id="pincode" name="pincode" required />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                            Save Address
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setAddingAddress(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-900">Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Sign Out</h4>
                          <p className="text-sm text-gray-600">Sign out of your account</p>
                        </div>
                        <Button
                          onClick={signOut}
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Type:</span>
                        <Badge variant={user.role === "seller" ? "default" : "secondary"}>
                          {user.role === "seller" ? "Seller Account" : "Buyer Account"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Status:</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email Verified:</span>
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
