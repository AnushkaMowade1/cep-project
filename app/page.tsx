import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen warli-pattern">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-balance"><span className="text-red-800 font-bold italic" style={{fontFamily: "'AMS Aasmi', 'Noto Sans Devanagari', sans-serif", fontSize: '1.1em', textShadow: '2px 2px 4px rgba(0,0,0,0.1)', transform: 'skew(-5deg)', display: 'inline-block', fontWeight: 'bold'}}>कला</span> Bazaar</h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              {"Discover authentic handcrafted sarees and salwars made by talented Indian artisan women"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="font-medium">
              <Link href="/auth/signup">{"Start Shopping"}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-medium border-2 bg-transparent">
              <Link href="/auth/login">{"Sign In"}</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">{"Authentic Craftsmanship"}</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                {"Every piece is handcrafted with traditional techniques passed down through generations"}
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">{"Empowering Women"}</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                {"Supporting self-help groups and women entrepreneurs across India"}
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">{"Secure Shopping"}</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                {"Safe and secure payment options with reliable delivery"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
