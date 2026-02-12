"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Trash2, Edit3, CheckCircle2, XCircle, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

export default function SuperAdmin() {
  const [venues, setVenues] = useState<any[]>([])
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null)
  
  const [editingVenue, setEditingVenue] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    const { data } = await supabase.from('venues').select('*').order('name')
    if (data) setVenues(data)
  }

  const toggleExpand = (id: string) => {
    setExpandedVenueId(expandedVenueId === id ? null : id)
  }

  const handleEditClick = (venue: any) => {
    setEditingVenue(venue)
    setIsEditOpen(true)
  }

  const saveEdit = async () => {
    await supabase.from('venues').update({ 
        name: editingVenue.name,
        location: editingVenue.location,
        google_maps_link: editingVenue.google_maps_link,
        lat: editingVenue.lat,
        lng: editingVenue.lng
    }).eq('id', editingVenue.id)
    setIsEditOpen(false)
    fetchVenues()
  }

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    await supabase.from('venues').update({ is_featured: !currentStatus }).eq('id', id)
    fetchVenues()
  }

  const deleteVenue = async (id: string) => {
    if (confirm("Delete venue?")) {
      await supabase.from('venues').delete().eq('id', id)
      fetchVenues()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-slate-900 text-white p-8 rounded-[2rem]">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-blue-500 w-8 h-8" /> Super Admin
            </h1>
            <p className="text-slate-400 text-sm mt-1">Platform Management</p>
          </div>
          <Badge className="bg-blue-600 px-4 py-2">System Active</Badge>
        </div>

        <div className="grid gap-6">
          {venues.map((venue) => (
            <Card key={venue.id} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50" onClick={() => toggleExpand(venue.id)}>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                            <img src={venue.image_url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">{venue.name}</h3>
                            <p className="text-sm text-slate-500">{venue.location}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant={venue.is_featured ? 'default' : 'secondary'}>
                            {venue.is_featured ? 'LIVE' : 'PENDING'}
                        </Badge>
                        {expandedVenueId === venue.id ? <ChevronUp /> : <ChevronDown />}
                    </div>
                </div>

                {expandedVenueId === venue.id && (
                    <div className="bg-slate-50 border-t border-slate-100 p-8 flex gap-4">
                        <Button onClick={() => toggleApproval(venue.id, venue.is_featured)} variant="outline" className="bg-white">
                            {venue.is_featured ? 'Deactivate' : 'Approve'}
                        </Button>
                        <Button onClick={() => handleEditClick(venue)} variant="outline" className="bg-white">
                            <Edit3 className="w-4 h-4 mr-2"/> Edit Details
                        </Button>
                        <Button onClick={() => deleteVenue(venue.id)} variant="outline" className="text-red-500 bg-white">
                            <Trash2 className="w-4 h-4 mr-2"/> Delete
                        </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Venue</DialogTitle></DialogHeader>
                {editingVenue && (
                    <div className="space-y-4 py-4">
                        <Input value={editingVenue.name} onChange={e => setEditingVenue({...editingVenue, name: e.target.value})} placeholder="Venue Name" />
                        <Input value={editingVenue.location} onChange={e => setEditingVenue({...editingVenue, location: e.target.value})} placeholder="Location" />
                        <Input value={editingVenue.google_maps_link} onChange={e => setEditingVenue({...editingVenue, google_maps_link: e.target.value})} placeholder="Google Maps Link" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input value={editingVenue.lat} onChange={e => setEditingVenue({...editingVenue, lat: e.target.value})} placeholder="Latitude" />
                            <Input value={editingVenue.lng} onChange={e => setEditingVenue({...editingVenue, lng: e.target.value})} placeholder="Longitude" />
                        </div>
                        <Button onClick={saveEdit} className="w-full bg-blue-600">Save Changes</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}