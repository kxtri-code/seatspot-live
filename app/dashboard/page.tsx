"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' 
import { Users, TrendingUp, IndianRupee, Calendar, CheckCircle, AlertTriangle, Map, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OwnerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [venue, setVenue] = useState<any>(null)
  const [stats, setStats] = useState({ totalSeats: 0, activeGuests: 0, totalRevenue: 0, occupancyRate: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  
  // Event Form State
  const [newEvent, setNewEvent] = useState({ 
    title: '', date: '', end_time: '', price: 0, description: '', image_url: ''
  })
  const [isEventModalOpen, setEventModalOpen] = useState(false)

  useEffect(() => {
    fetchOwnerData()
  }, [])

  const fetchOwnerData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // 1. FIND THE USER'S VENUE
      const { data: venues, error } = await supabase
        .from('venues')
        .select('*')
        .eq('owner_id', session.user.id)
        .single()

      if (error || !venues) {
        // If they are an Admin but have no venue, send them to onboarding
        router.push('/list-venue')
        return
      }

      setVenue(venues)

      // 2. GET SEATS & REVENUE FOR THIS SPECIFIC VENUE
      const { data: seats } = await supabase
        .from('seats')
        .select('*')
        .eq('venue_id', venues.id) // <--- CRITICAL FILTER

      if (seats) {
        const occupied = seats.filter(s => s.status === 'occupied')
        const revenue = occupied.length * 590 // Assuming avg ticket price 590

        setStats({
          totalSeats: seats.length,
          activeGuests: occupied.length,
          totalRevenue: revenue,
          occupancyRate: seats.length > 0 ? Math.round((occupied.length / seats.length) * 100) : 0
        })

        setRecentBookings(occupied.slice(0, 5))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!venue) return
    
    const { error } = await supabase.from('events').insert([{
        ...newEvent,
        venue_id: venue.id, // Link event to THIS venue
        venue_name: venue.name,
        price_per_seat: newEvent.price,
        image_url: newEvent.image_url || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26', 
        vibe_score: 95
    }])

    if (!error) {
        alert("Event Published Successfully!")
        setEventModalOpen(false)
    } else {
        alert(error.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase">{venue?.name || 'Dashboard'}</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stats.activeGuests > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                {stats.activeGuests > 0 ? 'Live Service Active' : 'Venue Offline'}
            </p>
          </div>
          
          <div className="flex gap-3">
             <Link href="/admin/layout-editor">
                <Button variant="outline" className="h-14 px-6 rounded-xl border-slate-300 hover:bg-slate-100 font-bold">
                    <Map className="w-5 h-5 mr-2" /> Edit Floor Plan
                </Button>
             </Link>

             <Dialog open={isEventModalOpen} onOpenChange={setEventModalOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-6 rounded-xl shadow-lg shadow-blue-200">
                        <Plus className="w-5 h-5 mr-2"/> New Event
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Host an Event at {venue?.name}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="Event Title" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                        <Input type="datetime-local" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                        <Input type="number" placeholder="Ticket Price" onChange={e => setNewEvent({...newEvent, price: Number(e.target.value)})} />
                        <Textarea placeholder="Description" onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                        <Button onClick={handleCreateEvent} className="w-full bg-blue-600 text-white font-bold py-6 rounded-xl">Publish</Button>
                    </div>
                </DialogContent>
             </Dialog>
          </div>
        </div>

        {/* ALERTS (If Setup Incomplete) */}
        {stats.totalSeats === 0 && (
            <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-orange-800">Your Floor Plan is Empty</h3>
                    <p className="text-sm text-orange-600">You cannot sell tickets until you add tables to your venue.</p>
                </div>
                <Link href="/admin/layout-editor" className="ml-auto">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Create Layout</Button>
                </Link>
            </div>
        )}

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            icon={IndianRupee} 
            color="text-green-600" 
            sub="Lifetime Earnings"
          />
          <StatCard 
            title="Live Guests" 
            value={stats.activeGuests} 
            icon={Users} 
            color="text-blue-600" 
            sub="Currently Seated"
          />
          <StatCard 
            title="Occupancy" 
            value={`${stats.occupancyRate}%`} 
            icon={TrendingUp} 
            color="text-orange-500" 
            sub={`${stats.activeGuests}/${stats.totalSeats} Seats Taken`}
          />
           <StatCard 
            title="Total Capacity" 
            value={stats.totalSeats} 
            icon={Calendar} 
            color="text-purple-600" 
            sub="Max Guests"
          />
        </div>

        {/* RECENT SALES */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
            <div className="space-y-4">
                {recentBookings.length > 0 ? (
                    recentBookings.map((seat, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle className="w-5 h-5"/>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{seat.guest_name || 'Guest'}</p>
                                    <p className="text-xs text-slate-500">Table {seat.label}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">+₹590</p>
                                <p className="text-[10px] text-slate-400">Paid via UPI</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        <p>No bookings yet.</p>
                        <p className="text-sm mt-1">Share your event link to start selling!</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, sub }: any) {
  return (
    <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-slate-50 rounded-2xl"><Icon className={`w-6 h-6 ${color}`} /></div>
        </div>
        <div>
            <h4 className={`text-4xl font-black ${color} tracking-tight`}>{value}</h4>
            <p className="text-sm font-bold text-slate-900 mt-1">{title}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}