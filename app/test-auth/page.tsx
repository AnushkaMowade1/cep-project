"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function TestAuthPage() {
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testPassword, setTestPassword] = useState("password123")
  const [result, setResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const testSignUp = async () => {
    setIsLoading(true)
    setResult("")
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: "Test User",
            phone: "+1234567890",
            user_type: "buyer",
          },
        },
      })
      
      if (error) {
        setResult(`❌ SignUp Error: ${error.message}`)
      } else {
        setResult(`✅ SignUp Success: User ${data.user?.email} created`)
      }
    } catch (err: any) {
      setResult(`❌ Exception: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSignIn = async () => {
    setIsLoading(true)
    setResult("")
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })
      
      if (error) {
        setResult(`❌ SignIn Error: ${error.message}`)
      } else {
        setResult(`✅ SignIn Success: User ${data.user?.email} logged in`)
      }
    } catch (err: any) {
      setResult(`❌ Exception: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setIsLoading(true)
    setResult("")
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      
      if (error) {
        setResult(`❌ DB Error: ${error.message}`)
      } else {
        setResult(`✅ Database Connection: Success`)
      }
    } catch (err: any) {
      setResult(`❌ Exception: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Auth Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label>Test Email:</label>
              <Input 
                value={testEmail} 
                onChange={(e) => setTestEmail(e.target.value)}
                type="email"
              />
            </div>
            
            <div className="space-y-2">
              <label>Test Password:</label>
              <Input 
                value={testPassword} 
                onChange={(e) => setTestPassword(e.target.value)}
                type="password"
              />
            </div>

            <div className="space-y-2">
              <Button onClick={testConnection} disabled={isLoading} className="w-full">
                Test DB Connection
              </Button>
              <Button onClick={testSignUp} disabled={isLoading} className="w-full">
                Test Sign Up
              </Button>
              <Button onClick={testSignIn} disabled={isLoading} className="w-full">
                Test Sign In
              </Button>
            </div>

            {result && (
              <div className="p-3 border rounded-md bg-muted">
                <pre className="text-sm whitespace-pre-wrap">{result}</pre>
              </div>
            )}

            <div className="pt-4 space-y-2">
              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full">Go to Real Signup</Button>
              </Link>
              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full">Go to Real Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}