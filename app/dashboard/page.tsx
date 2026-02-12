"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
// REMOVED BROKEN IMPORT: import { Select... } from "@/components/ui/select"
import { Users, TrendingUp, IndianRupee, Calendar, Image as ImageIcon } from 'lucide-react'
import AdminMap from '@/components/AdminMap'

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ totalBookings: 0, activeGuests: 0, totalRevenue: 0, occupancyRate: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  
  // Enhanced Event Form State
  const [newEvent, setNewEvent] = useState({ 
    title: '', venue_name: '', date: '', price: 0, 
    ticket_type: 'seated', ticket_url: '', image_url: '' 
  })
  const [isEventModalOpen, setEventModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: seats } = await supabase.from('seats').select('*')
    if (seats) {
      const occupied = seats.filter(s => s.status === 'occupied')
      setStats({
        totalBookings: seats.length,
        activeGuests: occupied.length,
        totalRevenue: occupied.length * 500, // Dummy avg price
        occupancyRate: seats.length > 0 ? (occupied.length / seats.length) * 100 : 0
      })
      setRecentBookings(occupied.slice(0, 5))
    }
  }

  const handleCreateEvent = async () => {
    const { error } = await supabase.from('events').insert([{
        title: newEvent.title,
        venue_name: newEvent.venue_name, 
        date: newEvent.date,
        price_per_seat: newEvent.price,
        image_url: newEvent.image_url || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26',
        ticket_type: newEvent.ticket_type,
        ticket_url: newEvent.ticket_url,
        vibe_score: 95
    }])
    if (!error) {
        alert("Event Published Successfully!")
        setEventModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase">Venue Manager</h1>
            <p className="text-slate-500 font-medium">Overview & Event Management</p>
          </div>
          
          <Dialog open={isEventModalOpen} onOpenChange={setEventModalOpen}>
              <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl">
                      <Calendar className="w-5 h-5 mr-2"/> Create Event
                  </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Add New Event</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Event Details</label>
                        <Input placeholder="Event Title (e.g. Jazz Night)" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                        <Input placeholder="Venue Name" onChange={e => setNewEvent({...newEvent, venue_name: e.target.value})} />
                        <Input type="datetime-local" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Ticket Settings</label>
                        {/* REPLACED WITH STANDARD HTML SELECT */}
                        <select 
                            className="w-full h-10 rounded-md border border-slate-200 px-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                            onChange={(e) => setNewEvent({...newEvent, ticket_type: e.target.value})}
                            value={newEvent.ticket_type}
                        >
                            <option value="seated">SeatSpot Booking (Map)</option>
                            <option value="external">External Link (BookMyShow etc.)</option>
                            <option value="rsvp">RSVP Only (Free)</option>
                        </select>
                      </div>

                      {newEvent.ticket_type === 'seated' && (
                          <Input type="number" placeholder="Price per Seat (INR)" onChange={e => setNewEvent({...newEvent, price: Number(e.target.value)})} />
                      )}

                      {newEvent.ticket_type === 'external' && (
                          <Input placeholder="Paste Ticket URL here..." onChange={e => setNewEvent({...newEvent, ticket_url: e.target.value})} />
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500 flex justify-between">
                            Event Image
                            <span className="text-[10px] text-blue-600">Rec: 1200x600px</span>
                        </label>
                        <div className="flex gap-2">
                            <Input placeholder="Image URL..." onChange={e => setNewEvent({...newEvent, image_url: e.target.value})} />
                            <Button variant="outline"><ImageIcon className="w-4 h-4" /></Button>
                        </div>
                      </div>

                      <Button onClick={handleCreateEvent} className="w-full bg-blue-600 text-white font-bold py-6 rounded-xl">
                          Publish Live
                      </Button>
                  </div>
              </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Active Guests" value={stats.activeGuests} icon={Users} color="text-blue-600" />
          <StatCard title="Occupancy" value={`${Math.round(stats.occupancyRate)}%`} icon={TrendingUp} color="text-orange-500" />
          <StatCard title="Est. Revenue" value={`₹${stats.totalRevenue}`} icon={IndianRupee} color="text-green-600" />
          <StatCard title="Total Tables" value={stats.totalBookings} icon={Calendar} color="text-purple-600" />
        </div>

        {/* Live Floor Plan */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-xl font-bold mb-6">Live Floor Overview</h3>
            <div className="bg-slate-50 rounded-2xl p-4 flex justify-center overflow-hidden">
                <AdminMap />
            </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
            <h4 className={`text-3xl font-black ${color} mt-1`}>{value}</h4>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl"><Icon className={`w-6 h-6 ${color}`} /></div>
      </CardContent>
    </Card>
  )
}