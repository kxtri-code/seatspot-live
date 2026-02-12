import './globals.css'
import Navbar from '@/components/Navbar'
import { Inter } from 'next/font/google'

// Using the Inter font to make the app look modern and professional
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SeatSpot - Discover & Book Your Vibe',
  description: 'The real-time discovery and table booking platform for the modern nightlife.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        {/* 1. The Navbar is placed here so it appears on EVERY page.
          2. It is "fixed" to the top, so we add "pt-16" (padding-top) 
             to the body so the rest of the app content starts below it.
        */}
        <Navbar />
        
        <main className="min-h-screen pt-16">
          {children}
        </main>

        {/* Optional: You can add a Footer here later 
          if you want it to show up on every page.
        */}
      </body>
    </html>
  )
}