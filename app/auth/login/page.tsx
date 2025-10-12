"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsResetting(true)
    setResetMessage(null)

    try {
      const supabase = createClient()
      if (!resetEmail) {
        setResetMessage('Please enter your email')
        return
      }

      const redirectTo = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/reset-password`

      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo,
      })

      if (error) throw error

      setResetMessage('If an account with that email exists, a password reset link has been sent.')
    } catch (err: unknown) {
      setResetMessage(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 warli-pattern">
      <div className="w-full max-w-md">
        <Card className="border-2 warli-border shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-serif text-balance">Welcome to Martify</CardTitle>
            <CardDescription className="text-pretty">
              {"Discover handcrafted sarees and salwars by Indian artisan women"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-center mt-2">
                <button
                  type="button"
                  className="text-sm text-primary underline"
                  onClick={() => setIsResetOpen(true)}
                >
                  Forgot password?
                </button>
              </div>
            </form>

            {/* Password reset modal (simple inline) */}
            {isResetOpen && (
              <div className="mt-6 p-4 border rounded-md bg-card">
                <h3 className="font-medium mb-2">Reset your password</h3>
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <div>
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="border-2"
                    />
                  </div>
                  {resetMessage && <p className="text-sm text-muted-foreground">{resetMessage}</p>}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isResetting}>
                      {isResetting ? 'Sending...' : 'Send reset link'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
            <div className="mt-6 text-center text-sm">
              {"Don't have an account? "}
              <Link
                href="/auth/signup"
                className="font-medium text-primary hover:text-primary/80 underline underline-offset-4"
              >
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
