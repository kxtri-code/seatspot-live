"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Ticket, User, LayoutDashboard, LogIn, Menu, X, ChefHat, Map, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getUser()
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => setUser(session?.user || null))
    return () => authListener.subscription.unsubscribe()
  }, [])

  // CHECK: Is this user an Admin? (Simple check for MVP)
  const isAdmin = user?.email === 'admin@seatspot.com' || user?.email === 'manager@seatspot.com'

  // Standard Guest Links
  const guestLinks = [
    { name: 'Discover', href: '/', icon: Ticket },
    { name: 'My Tickets', href: '/profile', icon: User },
  ]

  // Admin Only Links
  const adminLinks = [
    { name: 'Manager DB', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Kitchen', href: '/admin/kitchen', icon: ChefHat },
    { name: 'Digitizer', href: '/admin/layout-editor', icon: Map },
    { name: 'Super Admin', href: '/super-admin', icon: ShieldCheck },
  ]

  const activeLinks = isAdmin ? [...guestLinks, ...adminLinks] : guestLinks

  return (
    <nav className="fixed top-0 left-0 right-0 z-[5000] bg-slate-900/90 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter">SEATSPOT</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-6">
          {activeLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors hover:text-blue-400 ${
                pathname === link.href ? 'text-blue-500' : 'text-slate-300'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          ))}
          
          {!user ? (
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl">
                <LogIn className="w-4 h-4 mr-2" /> Login
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-black">
                {user.email[0].toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-white/10 p-6 flex flex-col gap-4 absolute w-full h-screen top-16 left-0">
          {activeLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 text-lg font-bold p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <div className="bg-blue-600/20 p-2 rounded-lg text-blue-500">
                <link.icon className="w-5 h-5" />
              </div>
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}