"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ticket, Calendar, User, LogOut } from 'lucide-react'
import Link from 'next/link'

type Booking = {
  id: string
  label: string
  guest_name: string
  status: string
}

export default function ProfilePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. Get the logged in user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setUser(session.user)
        
        // 2. Fetch their bookings (matching by name for now, or email)
        // In a production app, we would link seats to user_id
        const { data: seatData } = await supabase
          .from('seats')
          .select('*')
          .eq('guest_name', session.user.email) // Assuming they booked with their email
        
        if (seatData) setBookings(seatData)
      }
      setLoading(false)
    }
    fetchUserData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Profile...</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.email}</h1>
              <p className="text-slate-400 text-sm">Member since 2026</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8">
        <div className="grid gap-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="text-blue-600" /> My Active Tickets
          </h2>

          {bookings.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <p className="text-slate-500 mb-4">You haven't booked any seats yet.</p>
              <Link href="/">
                <Button className="bg-blue-600">Explore Events</Button>
              </Link>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden border-l-4 border-l-blue-600">
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">CONFIRMED</Badge>
                    <h3 className="text-xl font-bold text-slate-900">Table {booking.label}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> Show this at the entrance
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-100 p-2 rounded-lg inline-block mb-2">
                       {/* This is a placeholder for a unique ticket ID */}
                       <p className="text-[10px] font-mono text-slate-400">TICKET_ID</p>
                       <p className="font-mono font-bold text-xs">{booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}