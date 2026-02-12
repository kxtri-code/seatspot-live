"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ShieldCheck, Trash2, Edit3, CheckCircle2, XCircle, Calendar, ChevronDown, ChevronUp, MapPin, Navigation, Plus, Save, Link as LinkIcon } from 'lucide-react'

export default function SuperAdmin() {
  const [venues, setVenues] = useState<any[]>([])
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null)
  const [venueEvents, setVenueEvents] = useState<any[]>([])
  
  // EDIT STATES
  const [editingVenue, setEditingVenue] = useState<any>(null)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [activeVenueForEvent, setActiveVenueForEvent] = useState<any>(null)

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    const { data } = await supabase.from('venues').select('*').order('name')
    if (data) setVenues(data)
  }

  const fetchEvents = async (venueName: string) => {
    const { data } = await supabase.from('events').select('*').eq('venue_name', venueName).order('date')
    if (data) setVenueEvents(data)
  }

  const toggleExpand = (venue: any) => {
    if (expandedVenueId === venue.id) {
        setExpandedVenueId(null)
    } else {
        setExpandedVenueId(venue.id)
        fetchEvents(venue.name)
    }
  }

  // --- VENUE MANAGEMENT ---
  const handleEditVenue = (venue: any) => {
    setEditingVenue(venue)
    setIsVenueModalOpen(true)
  }

  const saveVenue = async () => {
    await supabase.from('venues').update({ 
        name: editingVenue.name,
        location: editingVenue.location,
        description: editingVenue.description,
        google_maps_link: editingVenue.google_maps_link,
        instagram: editingVenue.instagram,
        lat: editingVenue.lat,
        lng: editingVenue.lng,
        is_trending: editingVenue.is_trending
    }).eq('id', editingVenue.id)
    setIsVenueModalOpen(false)
    fetchVenues()
  }

  const deleteVenue = async (id: string) => {
    if (confirm("WARNING: This will delete the venue and ALL its events. Proceed?")) {
      await supabase.from('venues').delete().eq('id', id)
      fetchVenues()
    }
  }

  const toggleApproval = async (venue: any) => {
    await supabase.from('venues').update({ is_featured: !venue.is_featured }).eq('id', venue.id)
    fetchVenues()
  }

  // --- EVENT MANAGEMENT ---
  const handleAddEventClick = (venue: any) => {
    setEditingEvent({ venue_name: venue.name, title: '', date: '', price_per_seat: 0 }) // Empty template
    setActiveVenueForEvent(venue)
    setIsEventModalOpen(true)
  }

  const handleEditEventClick = (event: any, venue: any) => {
    setEditingEvent(event)
    setActiveVenueForEvent(venue)
    setIsEventModalOpen(true)
  }

  const saveEvent = async () => {
    const eventData = {
        title: editingEvent.title,
        venue_name: activeVenueForEvent.name,
        date: editingEvent.date,
        end_time: editingEvent.end_time,
        price_per_seat: editingEvent.price_per_seat,
        description: editingEvent.description,
        image_url: editingEvent.image_url || activeVenueForEvent.image_url,
        ticket_type: editingEvent.ticket_type || 'seated',
        ticket_url: editingEvent.ticket_url
    }

    if (editingEvent.id) {
        // UPDATE Existing
        await supabase.from('events').update(eventData).eq('id', editingEvent.id)
    } else {
        // INSERT New
        await supabase.from('events').insert([eventData])
    }
    
    setIsEventModalOpen(false)
    fetchEvents(activeVenueForEvent.name)
  }

  const deleteEvent = async (id: string) => {
    if (confirm("Delete this event?")) {
        await supabase.from('events').delete().eq('id', id)
        // Refresh events list
        if (expandedVenueId) {
             const venue = venues.find(v => v.id === expandedVenueId)
             if (venue) fetchEvents(venue.name)
        }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 pt-24 text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
              <ShieldCheck className="text-blue-500 w-10 h-10" /> God Mode
            </h1>
            <p className="text-slate-400 mt-2">Full Platform Control • {venues.length} Venues Active</p>
          </div>
          <Badge className="bg-red-600 px-6 py-2 text-lg animate-pulse">ADMIN ACCESS</Badge>
        </div>

        {/* VENUE LIST */}
        <div className="space-y-4">
          {venues.map((venue) => (
            <Card key={venue.id} className="rounded-3xl border-none shadow-lg overflow-hidden bg-slate-900 text-slate-200">
              <CardContent className="p-0">
                {/* VENUE ROW */}
                <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => toggleExpand(venue)}>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                            <img src={venue.image_url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white flex gap-2 items-center">
                                {venue.name}
                                {venue.is_trending && <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">Trending</Badge>}
                            </h3>
                            <p className="text-slate-400 flex items-center gap-2 mt-1">
                                <MapPin className="w-4 h-4"/> {venue.location}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge className={venue.is_featured ? 'bg-green-600' : 'bg-slate-700'}>
                            {venue.is_featured ? 'LIVE' : 'HIDDEN'}
                        </Badge>
                        {expandedVenueId === venue.id ? <ChevronUp /> : <ChevronDown />}
                    </div>
                </div>

                {/* EXPANDED CONTROL PANEL */}
                {expandedVenueId === venue.id && (
                    <div className="bg-slate-950/50 border-t border-slate-800 p-8 animate-in slide-in-from-top-5">
                        
                        {/* 1. VENUE CONTROLS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-800">
                            <div>
                                <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4">Venue Actions</h4>
                                <div className="flex gap-3">
                                    <Button onClick={() => handleEditVenue(venue)} className="bg-blue-600 hover:bg-blue-700">
                                        <Edit3 className="w-4 h-4 mr-2"/> Edit Profile & Loc
                                    </Button>
                                    <Button onClick={() => toggleApproval(venue)} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                                        {venue.is_featured ? 'Unpublish' : 'Publish Live'}
                                    </Button>
                                    <Button onClick={() => deleteVenue(venue.id)} variant="ghost" className="text-red-400 hover:bg-red-900/20">
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4">Location Check</h4>
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 border border-slate-700 flex-1 truncate">
                                        {venue.google_maps_link || 'No Map Link Set'}
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => window.open(venue.google_maps_link, '_blank')}>
                                        <Navigation className="w-3 h-3 mr-2"/> Test Link
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* 2. EVENT MANAGER */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-500"/> Scheduled Events
                                </h4>
                                <Button size="sm" onClick={() => handleAddEventClick(venue)} className="bg-green-600 hover:bg-green-700 text-white">
                                    <Plus className="w-4 h-4 mr-2"/> Add Event
                                </Button>
                            </div>

                            {venueEvents.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {venueEvents.map(event => (
                                        <div key={event.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center group hover:border-slate-600 transition-colors">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden">
                                                    <img src={event.image_url} className="w-full h-full object-cover"/>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{event.title}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {new Date(event.date).toLocaleDateString()} • {event.ticket_type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="secondary" onClick={() => handleEditEventClick(event, venue)}>
                                                    Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-500 italic p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                                    No events found. Add one to get started.
                                </div>
                            )}
                        </div>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- DIALOGS --- */}

        {/* EDIT VENUE DIALOG */}
        <Dialog open={isVenueModalOpen} onOpenChange={setIsVenueModalOpen}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Edit Venue (God Mode)</DialogTitle></DialogHeader>
                {editingVenue && (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Venue Name</label>
                                <Input value={editingVenue.name} onChange={e => setEditingVenue({...editingVenue, name: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Description</label>
                                <Textarea value={editingVenue.description} onChange={e => setEditingVenue({...editingVenue, description: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Display Location</label>
                                <Input value={editingVenue.location} onChange={e => setEditingVenue({...editingVenue, location: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Google Maps Link (Critical for Directions)</label>
                                <div className="flex gap-2">
                                    <Input value={editingVenue.google_maps_link || ''} onChange={e => setEditingVenue({...editingVenue, google_maps_link: e.target.value})} placeholder="https://maps.google.com/..." />
                                    <Button size="icon" variant="outline" onClick={() => window.open(editingVenue.google_maps_link, '_blank')}><LinkIcon className="w-4 h-4"/></Button>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500">Latitude</label>
                                <Input value={editingVenue.lat || ''} onChange={e => setEditingVenue({...editingVenue, lat: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500">Longitude</label>
                                <Input value={editingVenue.lng || ''} onChange={e => setEditingVenue({...editingVenue, lng: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Instagram Handle</label>
                                <Input value={editingVenue.instagram || ''} onChange={e => setEditingVenue({...editingVenue, instagram: e.target.value})} />
                            </div>
                        </div>
                        <Button onClick={saveVenue} className="w-full bg-blue-600 font-bold py-6">Save Changes</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>

        {/* EDIT/ADD EVENT DIALOG */}
        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editingEvent?.id ? 'Edit Event' : 'Create Event'}</DialogTitle></DialogHeader>
                {editingEvent && (
                    <div className="space-y-4 py-4">
                        <Input placeholder="Event Title" value={editingEvent.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500">Start</label>
                                <Input type="datetime-local" value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500">End</label>
                                <Input type="datetime-local" value={editingEvent.end_time || ''} onChange={e => setEditingEvent({...editingEvent, end_time: e.target.value})} />
                            </div>
                        </div>

                        <Textarea placeholder="Description..." value={editingEvent.description || ''} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-[10px] font-bold text-slate-500">Ticket Type</label>
                                <select 
                                    className="w-full h-10 rounded-md border border-slate-200 px-3 bg-white text-sm"
                                    value={editingEvent.ticket_type || 'seated'}
                                    onChange={(e) => setEditingEvent({...editingEvent, ticket_type: e.target.value})}
                                >
                                    <option value="seated">SeatSpot Booking</option>
                                    <option value="external">External Link</option>
                                    <option value="rsvp">RSVP</option>
                                </select>
                             </div>
                             <div>
                                <label className="text-[10px] font-bold text-slate-500">Price / URL</label>
                                <Input 
                                    placeholder={editingEvent.ticket_type === 'external' ? 'URL' : 'Price'} 
                                    value={editingEvent.ticket_type === 'external' ? (editingEvent.ticket_url || '') : (editingEvent.price_per_seat || 0)} 
                                    onChange={e => {
                                        if(editingEvent.ticket_type === 'external') setEditingEvent({...editingEvent, ticket_url: e.target.value})
                                        else setEditingEvent({...editingEvent, price_per_seat: e.target.value})
                                    }} 
                                />
                             </div>
                        </div>

                        <Input placeholder="Image URL" value={editingEvent.image_url || ''} onChange={e => setEditingEvent({...editingEvent, image_url: e.target.value})} />
                        
                        <Button onClick={saveEvent} className="w-full bg-green-600 font-bold py-6">
                            {editingEvent.id ? 'Update Event' : 'Publish Event'}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}