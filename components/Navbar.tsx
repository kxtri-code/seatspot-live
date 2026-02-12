"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Ticket, User, LayoutDashboard, LogIn, Menu, X } from 'lucide-react'

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

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const navLinks = [
    { name: 'Discover', href: '/', icon: Ticket },
    { name: 'My Tickets', href: '/profile', icon: User },
    { name: 'Admin', href: '/admin', icon: LayoutDashboard },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-[5000] bg-slate-900/80 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tighter">SEATSPOT</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                pathname === link.href ? 'text-blue-500' : 'text-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {!user ? (
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <LogIn className="w-4 h-4 mr-2" /> Login
              </Button>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border border-white/20 text-xs font-bold">
              {user.email[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-lg font-semibold"
            >
              <link.icon className="w-5 h-5 text-blue-500" />
              {link.name}
            </Link>
          ))}
          {!user && (
             <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-blue-600">Login</Button>
             </Link>
          )}
        </div>
      )}
    </nav>
  )
}