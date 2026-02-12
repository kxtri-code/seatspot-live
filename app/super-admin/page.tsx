"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Store, Trash2, Edit3, CheckCircle2, XCircle } from 'lucide-react'

export default function SuperAdmin() {
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    const { data } = await supabase.from('venues').select('*').order('name')
    if (data) setVenues(data)
    setLoading(false)
  }

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    await supabase.from('venues').update({ is_featured: !currentStatus }).eq('id', id)
    fetchVenues()
  }

  const deleteVenue = async (id: string) => {
    if (confirm("Are you sure? This will remove the venue from the platform.")) {
      await supabase.from('venues').delete().eq('id', id)
      fetchVenues()
    }
  }

  if (loading) return <div className="p-20 text-center font-bold">Accessing Secure Records...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between bg-slate-900 text-white p-8 rounded-[2rem]">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <ShieldCheck className="text-blue-500 w-8 h-8" /> Super Admin
            </h1>
            <p className="text-slate-400 text-sm mt-1">Platform-wide Venue Management</p>
          </div>
          <Badge className="bg-blue-600 px-4 py-2">System Active</Badge>
        </div>

        <div className="grid gap-4">
          {venues.map((venue) => (
            <Card key={venue.id} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                    <img src={venue.image_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{venue.name}</h3>
                    <p className="text-sm text-slate-500">{venue.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => toggleApproval(venue.id, venue.is_featured)}
                    className={`rounded-xl px-6 ${venue.is_featured ? 'border-green-200 text-green-600' : 'border-slate-200 text-slate-400'}`}
                  >
                    {venue.is_featured ? <CheckCircle2 className="w-4 h-4 mr-2"/> : <XCircle className="w-4 h-4 mr-2"/>}
                    {venue.is_featured ? 'Approved' : 'Pending'}
                  </Button>
                  <Button variant="ghost" className="text-slate-400 hover:text-blue-600">
                    <Edit3 className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => deleteVenue(venue.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}