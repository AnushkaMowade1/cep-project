"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-serif font-bold">
              <span className="text-red-800" style={{fontFamily: "'AMS Aasmi', 'Noto Sans Devanagari', sans-serif"}}>कला</span> Bazaar
            </span>
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-600">
            <Link href="/shop" className="hover:text-red-800 transition-colors">
              Shop
            </Link>
            <Link href="/favorites" className="hover:text-red-800 transition-colors">
              Favorites
            </Link>
            <Link href="/orders" className="hover:text-red-800 transition-colors">
              Orders
            </Link>
            <Link href="/profile" className="hover:text-red-800 transition-colors">
              Profile
            </Link>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t text-center text-sm text-gray-500">
          <p>&copy; 2025 कला Bazaar. Empowering Indian Artisan Women.</p>
        </div>
      </div>
    </footer>
  )
}