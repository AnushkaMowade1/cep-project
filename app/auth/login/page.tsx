"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/profile")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 warli-pattern">
      <div className="w-full max-w-md">
        <Card className="border-2 warli-border shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-primary">
              Welcome to Martify
            </CardTitle>
            <CardDescription className="text-pretty">
              We've simplified our authentication system. You'll be redirected to create your profile.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Redirecting to profile page in 2 seconds...
            </p>
            
            <Button asChild className="w-full">
              <Link href="/profile">Go to Profile Now</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
