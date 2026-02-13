"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Map, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  User, 
  Ticket, 
  UtensilsCrossed,
  ShieldCheck,
  UserCheck // Added Icon
} from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  // Define Links
  const userLinks = [
    { name: 'Home', href: '/', icon: Map },
    { name: 'My Tickets', href: '/profile', icon: Ticket },
  ]

  const adminLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Guest List (CRM)', href: '/admin/guests', icon: UserCheck }, // The New Link
    { name: 'Floor Plan', href: '/admin/layout-editor', icon: Map },
  ]

  const superAdminLinks = [
    { name: 'God Mode', href: '/super-admin', icon: ShieldCheck },
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Determine which links to show based on user role
  // (In a real app, you'd check user.role from DB. For now, we show based on page context or login status)
  const links = pathname.startsWith('/admin') || pathname.startsWith('/dashboard') 
    ? adminLinks 
    : pathname.startsWith('/super-admin')
    ? superAdminLinks
    : userLinks

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">S</div>
            <span className="font-black text-xl tracking-tighter text-slate-900">SeatSpot.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === link.href ? 'text-blue-600' : 'text-slate-500'}`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
                <Button onClick={handleLogout} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4 mr-2"/> Logout
                </Button>
            ) : (
                <Link href="/login">
                    <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6">Login</Button>
                </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900">
              {isOpen ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full px-4 py-4 space-y-4 shadow-xl">
          {links.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-slate-600 font-medium p-2 rounded-lg hover:bg-slate-50"
            >
              <link.icon className="w-5 h-5" /> {link.name}
            </Link>
          ))}
           {user ? (
                <button onClick={handleLogout} className="flex w-full items-center gap-3 text-red-500 font-medium p-2 rounded-lg hover:bg-red-50">
                    <LogOut className="w-5 h-5"/> Logout
                </button>
            ) : (
                <Link href="/login" onClick={() => setIsOpen(false)} className="flex w-full items-center gap-3 text-blue-600 font-medium p-2">
                    <User className="w-5 h-5"/> Login
                </Link>
            )}
        </div>
      )}
    </nav>
  )
}