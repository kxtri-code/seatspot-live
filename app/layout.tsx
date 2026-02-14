import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// Now these imports will work because we created the files!
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SeatSpot',
  description: 'Find your vibe.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        {/* Desktop Header (Fixed Top) */}
        <Header />
        
        {/* Main Content (Padded so it doesn't hide behind header/footer) */}
        <main className="pt-16 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>

        {/* Mobile Bottom Nav (Fixed Bottom) */}
        <MobileNav />
      </body>
    </html>
  )
}