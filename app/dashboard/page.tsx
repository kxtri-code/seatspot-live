"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' 
import { Users, TrendingUp, IndianRupee, Calendar, Upload, Instagram, Facebook, Youtube, Image as ImageIcon } from 'lucide-react'
import AdminMap from '@/components/AdminMap'

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ totalBookings: 0, activeGuests: 0, totalRevenue: 0, occupancyRate: 0 })
  const [newEvent, setNewEvent] = useState({ 
    title: '', venue_name: '', date: '', end_time: '', price: 0, 
    description: '', ticket_type: 'seated', ticket_url: '', image_url: '',
    instagram_url: '', facebook_url: '', youtube_url: ''
  })
  const [isEventModalOpen, setEventModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

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
        totalRevenue: occupied.length * 500,
        occupancyRate: seats.length > 0 ? (occupied.length / seats.length) * 100 : 0
      })
    }
  }

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
        image_url: newEvent.image_url || 'https://images.unsplash.com/photo-1514525253440-b393452e8d26', // Fallback image
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
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase">Venue Manager</h1>
            <p className="text-slate-500 font-medium">Manage Events & Floor</p>
          </div>
          
          <Dialog open={isEventModalOpen} onOpenChange={setEventModalOpen}>
              <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl">
                      <Calendar className="w-5 h-5 mr-2"/> Create Event
                  </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Add New Event</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                      
                      {/* DETAILS */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Event Info</label>
                        <Input placeholder="Event Title" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                        <Input placeholder="Venue Name" onChange={e => setNewEvent({...newEvent, venue_name: e.target.value})} />
                        <Textarea placeholder="Description..." onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                      </div>

                      {/* TIMING */}
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

                      {/* SOCIALS */}
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase text-slate-500">Social Links</label>
                         <div className="flex gap-2"><Instagram className="w-4 h-4 mt-3 text-slate-400"/><Input placeholder="Instagram URL" onChange={e => setNewEvent({...newEvent, instagram_url: e.target.value})} /></div>
                         <div className="flex gap-2"><Facebook className="w-4 h-4 mt-3 text-slate-400"/><Input placeholder="Facebook URL" onChange={e => setNewEvent({...newEvent, facebook_url: e.target.value})} /></div>
                      </div>

                      {/* IMAGE */}
                      <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                        <label className="text-xs font-bold uppercase text-slate-500 flex justify-between">
                            Event Banner <span className="text-[10px] text-blue-600">Rec: 1200x600px</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <Input type="file" onChange={handleImageUpload} disabled={uploading} className="text-xs" />
                            {uploading && <span className="text-xs text-blue-500 animate-pulse">Uploading...</span>}
                        </div>
                        {newEvent.image_url && <p className="text-[10px] text-green-600 mt-1">Image Ready!</p>}
                      </div>

                      <Button onClick={handleCreateEvent} disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-6 rounded-xl">
                          Publish Event
                      </Button>
                  </div>
              </DialogContent>
          </Dialog>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Active Guests" value={stats.activeGuests} icon={Users} color="text-blue-600" />
          <StatCard title="Occupancy" value={`${Math.round(stats.occupancyRate)}%`} icon={TrendingUp} color="text-orange-500" />
          <StatCard title="Revenue" value={`₹${stats.totalRevenue}`} icon={IndianRupee} color="text-green-600" />
          <StatCard title="Tables" value={stats.totalBookings} icon={Calendar} color="text-purple-600" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-xl font-bold mb-6">Live Floor Overview</h3>
            <div className="bg-slate-50 rounded-2xl p-4 flex justify-center overflow-hidden"><AdminMap /></div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
      <CardContent className="p-6 flex justify-between items-center">
        <div><p className="text-xs font-bold text-slate-400 uppercase">{title}</p><h4 className={`text-3xl font-black ${color}`}>{value}</h4></div>
        <div className="p-3 bg-slate-50 rounded-2xl"><Icon className={`w-6 h-6 ${color}`} /></div>
      </CardContent>
    </Card>
  )
}