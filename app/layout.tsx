import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import Footer from '@/components/footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Martify - Indian Art E-commerce',
    template: '%s | Martify'
  },
  description: 'Discover and shop authentic Indian art, paintings, and handicrafts at Martify. Supporting local artists and traditional craftsmanship.',
  keywords: 'Indian art, paintings, handicrafts, traditional art, martify, art marketplace',
  authors: [{ name: 'Martify' }],
  openGraph: {
    title: 'Martify - Indian Art E-commerce',
    description: 'Discover and shop authentic Indian art, paintings, and handicrafts',
    type: 'website',
    siteName: 'Martify',
  },
  twitter: {
    title: 'Martify - Indian Art E-commerce',
    description: 'Discover and shop authentic Indian art, paintings, and handicrafts',
  },
  robots: 'index, follow',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Kalam:wght@400;700&family=Mukti:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.cdnfonts.com/css/ams-afrin"
          rel="stylesheet"
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} flex flex-col min-h-screen`}>
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
