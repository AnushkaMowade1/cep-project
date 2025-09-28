import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 warli-pattern">
      <div className="w-full max-w-md">
        <Card className="border-2 warli-border shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-serif text-balance">{"Check Your Email"}</CardTitle>
            <CardDescription className="text-pretty">{"We've sent you a verification link"}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {
                "Please check your email and click the verification link to activate your account. Once verified, you can start exploring Martify."
              }
            </p>
            <div className="pt-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary hover:text-primary/80 underline underline-offset-4"
              >
                {"Back to Sign In"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
