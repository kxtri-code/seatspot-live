"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Users, TrendingUp, IndianRupee, Calendar } from 'lucide-react'
import AdminMap from '@/components/AdminMap'

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ totalBookings: 0, activeGuests: 0, totalRevenue: 0, occupancyRate: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  
  // Event Form State
  const [newEvent, setNewEvent] = useState({ title: '', venue_name: '', date: '', price: 0 })
  const [isEventModalOpen, setEventModalOpen] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: seats } = await supabase.from('seats').select('*')
      const { data: events } = await supabase.from('events').select('price_per_seat')

      if (seats) {
        const occupied = seats.filter(s => s.status === 'occupied')
        const avgPrice = events?.[0]?.price_per_seat || 500 // INR Default
        setStats({
          totalBookings: seats.length,
          activeGuests: occupied.length,
          totalRevenue: occupied.length * avgPrice,
          occupancyRate: seats.length > 0 ? (occupied.length / seats.length) * 100 : 0
        })
        setRecentBookings(occupied.slice(0, 5))
      }
    }
    fetchDashboardData()
  }, [])

  const handleCreateEvent = async () => {
    // Basic event creation logic
    const { error } = await supabase.from('events').insert([{
        title: newEvent.title,
        venue_name: newEvent.venue_name,
        date: newEvent.date,
        price_per_seat: newEvent.price,
        image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30', // Placeholder
        vibe_score: 95
    }])
    if (!error) {
        alert("Event Created!")
        setEventModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase">Venue Manager</h1>
            <p className="text-slate-500 font-medium">Real-time business intelligence.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white">Export Report</Button>
            
            {/* WORKING MANAGE EVENTS BUTTON */}
            <Dialog open={isEventModalOpen} onOpenChange={setEventModalOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-blue-600 text-white font-bold">
                        <Calendar className="w-4 h-4 mr-2"/> Add Event
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="Event Title" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                        <Input placeholder="Venue Name" onChange={e => setNewEvent({...newEvent, venue_name: e.target.value})} />
                        <Input type="datetime-local" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                        <Input type="number" placeholder="Price (INR)" onChange={e => setNewEvent({...newEvent, price: Number(e.target.value)})} />
                        <Button onClick={handleCreateEvent} className="w-full bg-blue-600 text-white">Publish Event</Button>
                    </div>
                </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Active Guests" value={stats.activeGuests} icon={Users} color="text-blue-600" />
          <StatCard title="Occupancy" value={`${Math.round(stats.occupancyRate)}%`} icon={TrendingUp} color="text-orange-500" />
          {/* INR SYMBOL */}
          <StatCard title="Est. Revenue" value={`₹${stats.totalRevenue}`} icon={IndianRupee} color="text-green-600" />
          <StatCard title="Total Tables" value={stats.totalBookings} icon={Calendar} color="text-purple-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              Live Floor Plan
            </h3>
            <div className="flex justify-center bg-slate-50 rounded-2xl p-4 overflow-hidden">
                <AdminMap />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-bold mb-6">Recent Check-ins</h3>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Table {booking.label}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{booking.guest_name || 'Anonymous'}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-none">LIVE</Badge>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-10 italic">No active guests.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-3xl border-none shadow-sm overflow-hidden group hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            <h4 className={`text-3xl font-black ${color}`}>{value}</h4>
          </div>
          <div className={`p-4 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}