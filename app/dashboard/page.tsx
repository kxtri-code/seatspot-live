"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' 
import { Users, TrendingUp, IndianRupee, Calendar, Image as ImageIcon, Upload, Instagram, Facebook, Youtube, Clock, CheckCircle } from 'lucide-react'
import AdminMap from '@/components/AdminMap'

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ totalSeats: 0, activeGuests: 0, totalRevenue: 0, occupancyRate: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  
  // Event Form State (Kept from previous version)
  const [newEvent, setNewEvent] = useState({ 
    title: '', venue_name: '', date: '', end_time: '', price: 0, 
    description: '', ticket_type: 'seated', ticket_url: '', image_url: '',
    instagram_url: '', facebook_url: '', youtube_url: ''
  })
  const [isEventModalOpen, setEventModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  // TICKET PRICE (Hardcoded for demo, normally fetched from DB)
  const TICKET_PRICE = 590 // 500 + 90 GST

  useEffect(() => {
    fetchLiveStats()
    
    // Optional: Subscribe to Real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'seats' }, (payload) => {
        fetchLiveStats() // Refresh whenever a seat changes
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchLiveStats = async () => {
    // 1. Get ALL seats for this venue (In real app, filter by user's venue_id)
    const { data: seats } = await supabase.from('seats').select('*')
    
    if (seats) {
      const occupied = seats.filter(s => s.status === 'occupied')
      
      setStats({
        totalSeats: seats.length,
        activeGuests: occupied.length,
        totalRevenue: occupied.length * TICKET_PRICE,
        occupancyRate: seats.length > 0 ? Math.round((occupied.length / seats.length) * 100) : 0
      })

      // Create a "Recent Activity" feed from the occupied seats
      setRecentBookings(occupied.slice(0, 5))
    }
  }

  // ... (Keep handleImageUpload and handleCreateEvent same as before) ...
  // [Paste the previous handleImageUpload and handleCreateEvent functions here if you need them, 
  //  otherwise they are preserved if you only update the stats logic]
   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return
      
      const file = e.target.files[0]
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `events/${fileName}`

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('images').getPublicUrl(filePath)
      setNewEvent({ ...newEvent, image_url: data.publicUrl })
      alert("Image Uploaded!")
    } catch (error: any) {
      alert("Upload Error: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleCreateEvent = async () => {
    const { error } = await supabase.from('events').insert([{
        ...newEvent,
        price_per_seat: newEvent.price,
        image_url: newEvent.image_url || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26', 
        vibe_score: 95
    }])
    if (!error) {
        alert("Event Published!")
        setEventModalOpen(false)
    } else {
        alert(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase">Venue Manager</h1>
            <p className="text-slate-500 font-medium">Live Business Overview</p>
          </div>
          
          <Dialog open={isEventModalOpen} onOpenChange={setEventModalOpen}>
              <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-200">
                      <Calendar className="w-5 h-5 mr-2"/> Create Event
                  </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                   <DialogHeader><DialogTitle>Add New Event</DialogTitle></DialogHeader>
                   <div className="space-y-4 py-4">
                      {/* ... (Keep the Event Form Inputs exactly as before) ... */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Event Info</label>
                            <Input placeholder="Event Title" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                            <Input placeholder="Venue Name" onChange={e => setNewEvent({...newEvent, venue_name: e.target.value})} />
                            <Textarea placeholder="Description..." onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">Starts</label>
                                <Input type="datetime-local" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500">Ends</label>
                                <Input type="datetime-local" onChange={e => setNewEvent({...newEvent, end_time: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">Social Links</label>
                             <div className="flex gap-2"><Instagram className="w-4 h-4 mt-3 text-slate-400"/><Input placeholder="Instagram URL" onChange={e => setNewEvent({...newEvent, instagram_url: e.target.value})} /></div>
                             <div className="flex gap-2"><Facebook className="w-4 h-4 mt-3 text-slate-400"/><Input placeholder="Facebook URL" onChange={e => setNewEvent({...newEvent, facebook_url: e.target.value})} /></div>
                        </div>
                        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                            <label className="text-xs font-bold uppercase text-slate-500 flex justify-between">Event Banner</label>
                            <Input type="file" onChange={handleImageUpload} disabled={uploading} className="text-xs" />
                        </div>
                        <Button onClick={handleCreateEvent} disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-6 rounded-xl">Publish Event</Button>
                   </div>
              </DialogContent>
          </Dialog>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            icon={IndianRupee} 
            color="text-green-600" 
            sub="Today's Earnings"
          />
          <StatCard 
            title="Active Guests" 
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
            sub={`${stats.activeGuests}/${stats.totalSeats} Seats`}
          />
           <StatCard 
            title="Total Capacity" 
            value={stats.totalSeats} 
            icon={Calendar} 
            color="text-purple-600" 
            sub="Registered Tables"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LIVE MAP */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Live Floor Overview
                </h3>
                <div className="bg-slate-50 rounded-2xl p-4 flex justify-center overflow-hidden">
                    <AdminMap />
                </div>
            </div>

            {/* RECENT BOOKINGS FEED */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                    {recentBookings.length > 0 ? (
                        recentBookings.map((seat, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                    <CheckCircle className="w-5 h-5"/>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{seat.guest_name || 'Anonymous'}</p>
                                    <p className="text-xs text-slate-500">Booked Table {seat.label}</p>
                                </div>
                                <div className="ml-auto text-xs font-bold text-green-600">+₹590</div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-10">No bookings yet today.</p>
                    )}
                </div>
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
             <Badge variant="outline" className="text-xs font-normal text-slate-400 border-slate-200">Today</Badge>
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