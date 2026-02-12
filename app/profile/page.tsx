"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, QrCode, Ticket, LogOut } from 'lucide-react'
import QRCode from "react-qr-code" // The library you just installed
import Link from 'next/link'

export default function MyTickets() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [rsvps, setRsvps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
        return
      }
      setUser(session.user)

      // 1. Fetch Table Reservations (Live Seats)
      const { data: seats } = await supabase.from('seats').select('*').eq('guest_name', session.user.email)
      if (seats) setBookings(seats)

      // 2. Fetch Event RSVPs
      // We join with the 'events' table to get details
      const { data: eventData } = await supabase
        .from('event_responses')
        .select('*, events(*)')
        .eq('user_email', session.user.email)
        .eq('status', 'going')
      
      if (eventData) setRsvps(eventData)
      setLoading(false)
    }
    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Wallet...</div>

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-24 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black text-slate-900">My Tickets</h1>
                <p className="text-slate-500">{user?.email}</p>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2"/> Logout
            </Button>
        </div>

        {/* SECTION 1: TABLE RESERVATIONS */}
        {bookings.length > 0 && (
            <div>
                <h2 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-widest">Active Table Bookings</h2>
                <div className="space-y-4">
                    {bookings.map((seat) => (
                        <div key={seat.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 relative">
                            {/* TICKET TOP */}
                            <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                                <div>
                                    <Badge className="bg-green-500 text-slate-900 font-bold mb-2">CONFIRMED</Badge>
                                    <h3 className="text-2xl font-black">Table {seat.label}</h3>
                                    <p className="opacity-80 text-sm">Valid for tonight</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
                                    <Ticket className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            
                            {/* TICKET BODY */}
                            <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                <div className="bg-white p-2 rounded-xl border-2 border-slate-900">
                                    <QRCode 
                                        value={`TABLE_BOOKING:${seat.id}:${user.email}`} 
                                        size={100} 
                                        viewBox={`0 0 100 100`}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    />
                                </div>
                                <div className="space-y-3 flex-1 text-center md:text-left">
                                    <div className="flex items-center gap-3 text-slate-600 justify-center md:justify-start">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        <span className="font-bold"> arrive by 8:30 PM</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 justify-center md:justify-start">
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        <span>Show this to the Manager</span>
                                    </div>
                                    <p className="text-xs text-slate-400">Booking ID: {seat.id.slice(0,8)}</p>
                                </div>
                            </div>

                            {/* Perforated Edge Effect */}
                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full"></div>
                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* SECTION 2: EVENT PASSES */}
        {rsvps.length > 0 && (
            <div>
                <h2 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-widest mt-8">Event Passes</h2>
                <div className="space-y-4">
                    {rsvps.map((rsvp) => (
                        <div key={rsvp.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col md:flex-row">
                             {/* IMAGE SIDE */}
                             <div className="md:w-1/3 bg-slate-200 relative h-32 md:h-auto">
                                <img src={rsvp.events?.image_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20"></div>
                             </div>

                             {/* CONTENT SIDE */}
                             <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold">{rsvp.events?.title}</h3>
                                        <Badge variant="outline" className="border-blue-500 text-blue-500">RSVP: GOING</Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                                        <MapPin className="w-3 h-3"/> {rsvp.events?.venue_name}
                                    </p>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <div className="text-xs text-slate-400">
                                        <span className="block font-bold text-slate-600">{new Date(rsvp.events?.date).toLocaleDateString()}</span>
                                        {new Date(rsvp.events?.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    <Button size="sm" variant="secondary" className="text-xs">
                                        <QrCode className="w-3 h-3 mr-2"/> View Code
                                    </Button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* EMPTY STATE */}
        {bookings.length === 0 && rsvps.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <Ticket className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700">No Active Tickets</h3>
                <p className="text-slate-500 mb-6">You haven't booked any tables or events yet.</p>
                <Link href="/">
                    <Button className="bg-blue-600 text-white font-bold rounded-xl">Explore Events</Button>
                </Link>
            </div>
        )}

      </div>
    </div>
  )
}