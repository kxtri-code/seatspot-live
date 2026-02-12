"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Trash2, Edit3, CheckCircle2, XCircle, Calendar, Plus, ChevronDown, ChevronUp } from 'lucide-react'

export default function SuperAdmin() {
  const [venues, setVenues] = useState<any[]>([])
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null)
  const [venueEvents, setVenueEvents] = useState<any[]>([])
  
  // Edit/Add States
  const [editingVenue, setEditingVenue] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', date: '', price: 0 })
  const [isEventModalOpen, setEventModalOpen] = useState(false)

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    const { data } = await supabase.from('venues').select('*').order('name')
    if (data) setVenues(data)
  }

  const fetchEventsForVenue = async (venueName: string) => {
    const { data } = await supabase.from('events').select('*').eq('venue_name', venueName)
    if (data) setVenueEvents(data)
  }

  const toggleExpand = (venue: any) => {
    if (expandedVenueId === venue.id) {
        setExpandedVenueId(null)
    } else {
        setExpandedVenueId(venue.id)
        fetchEventsForVenue(venue.name)
    }
  }

  const handleEditClick = (venue: any) => {
    setEditingVenue(venue)
    setIsEditOpen(true)
  }

  const saveEdit = async () => {
    await supabase.from('venues').update({ 
        name: editingVenue.name,
        location: editingVenue.location 
    }).eq('id', editingVenue.id)
    setIsEditOpen(false)
    fetchVenues()
  }

  const handleAddEvent = async () => {
    const currentVenue = venues.find(v => v.id === expandedVenueId)
    if (!currentVenue) return

    const { error } = await supabase.from('events').insert([{
        title: newEvent.title,
        venue_name: currentVenue.name,
        date: newEvent.date,
        price_per_seat: newEvent.price,
        image_url: currentVenue.image_url,
        vibe_score: 90
    }])
    if (!error) {
        alert("Event Added to Venue!")
        setEventModalOpen(false)
        fetchEventsForVenue(currentVenue.name)
    }
  }

  const deleteVenue = async (id: string) => {
    if (confirm("Permanently delete this venue and all its events?")) {
      await supabase.from('venues').delete().eq('id', id)
      fetchVenues()
    }
  }

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    await supabase.from('venues').update({ is_featured: !currentStatus }).eq('id', id)
    fetchVenues()
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-slate-900 text-white p-8 rounded-[2rem]">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-blue-500 w-8 h-8" /> Super Admin
            </h1>
            <p className="text-slate-400 text-sm mt-1">Global Platform Management</p>
          </div>
          <Badge className="bg-blue-600 px-4 py-2">System Active</Badge>
        </div>

        <div className="grid gap-6">
          {venues.map((venue) => (
            <Card key={venue.id} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white transition-all">
              <CardContent className="p-0">
                {/* VENUE HEADER ROW */}
                <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => toggleExpand(venue)}>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                            <img src={venue.image_url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">{venue.name}</h3>
                            <p className="text-sm text-slate-500">{venue.location} • {venue.category || 'Venue'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant={venue.is_featured ? 'default' : 'secondary'}>
                            {venue.is_featured ? 'LIVE' : 'PENDING'}
                        </Badge>
                        {expandedVenueId === venue.id ? <ChevronUp /> : <ChevronDown />}
                    </div>
                </div>

                {/* EXPANDED SECTION (Events & Actions) */}
                {expandedVenueId === venue.id && (
                    <div className="bg-slate-50 border-t border-slate-100 p-8 animate-in slide-in-from-top-2">
                        
                        {/* Action Bar */}
                        <div className="flex gap-3 mb-8 border-b border-slate-200 pb-6">
                            <Button onClick={() => toggleApproval(venue.id, venue.is_featured)} variant="outline" className="bg-white">
                                {venue.is_featured ? 'Deactivate Venue' : 'Approve Venue'}
                            </Button>
                            <Button onClick={() => handleEditClick(venue)} variant="outline" className="bg-white">
                                <Edit3 className="w-4 h-4 mr-2"/> Edit Details
                            </Button>
                            <Button onClick={() => deleteVenue(venue.id)} variant="outline" className="text-red-500 hover:bg-red-50 bg-white">
                                <Trash2 className="w-4 h-4 mr-2"/> Delete Venue
                            </Button>
                        </div>

                        {/* Events List */}
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600"/> Upcoming Events
                            </h4>
                            <Button size="sm" onClick={() => setEventModalOpen(true)} className="bg-blue-600 text-white">
                                <Plus className="w-4 h-4 mr-2"/> Add Event
                            </Button>
                        </div>

                        {venueEvents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {venueEvents.map(event => (
                                    <div key={event.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">{event.title}</p>
                                            <p className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="secondary">₹{event.price_per_seat}</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">No events scheduled yet.</p>
                        )}
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* EDIT DIALOG */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Venue Details</DialogTitle></DialogHeader>
                {editingVenue && (
                    <div className="space-y-4 py-4">
                        <Input value={editingVenue.name} onChange={e => setEditingVenue({...editingVenue, name: e.target.value})} />
                        <Input value={editingVenue.location} onChange={e => setEditingVenue({...editingVenue, location: e.target.value})} />
                        <Button onClick={saveEdit} className="w-full bg-blue-600">Save Changes</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>

        {/* ADD EVENT DIALOG */}
        <Dialog open={isEventModalOpen} onOpenChange={setEventModalOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Event to Venue</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Event Title" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                    <Input type="datetime-local" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                    <Input type="number" placeholder="Price (INR)" onChange={e => setNewEvent({...newEvent, price: Number(e.target.value)})} />
                    <Button onClick={handleAddEvent} className="w-full bg-blue-600">Publish Event</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}