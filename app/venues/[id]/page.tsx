"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Info, Utensils, Phone, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function VenueProfile() {
  const params = useParams()
  const [venue, setVenue] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVenue = async () => {
      if (!params?.id) return
      const { data } = await supabase
        .from('venues')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) setVenue(data)
      setLoading(false)
    }
    fetchVenue()
  }, [params?.id])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Venue Profile...</div>
  if (!venue) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-bold">Venue not found. Check if the ID matches your database.</div>

  return (
    <div className="min-h-screen bg-white">
      {/* Visual Header */}
      <div className="relative h-[40vh] w-full bg-slate-900">
        <img src={venue.image_url} className="w-full h-full object-cover opacity-70" alt={venue.name} />
        <div className="absolute top-6 left-6 z-10">
          <Link href="/">
            <Button variant="outline" className="bg-white/20 text-white backdrop-blur-md border-white/30 hover:bg-white/40">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discovery
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-slate-900">{venue.name}</h1>
                <Badge className="bg-yellow-400 text-yellow-900 border-none px-3 py-1 font-bold">TOP RATED</Badge>
              </div>
              <p className="flex items-center gap-1 text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-blue-500" /> {venue.location}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900">{venue.rating}</p>
                <div className="flex text-yellow-500">
                  <Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-2xl text-lg font-bold">
                Follow Venue
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12 pt-12 border-t border-slate-100">
            <div className="md:col-span-2 space-y-10">
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                  <Info className="text-blue-500 w-5 h-5" /> Experience
                </h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {venue.description}
                </p>
              </section>
              
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900">
                  <Utensils className="text-blue-500 w-5 h-5" /> Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-900">Elite Atmosphere</p>
                    <p className="text-sm text-slate-500">Perfect for private bookings and events.</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-900">Regional Cuisine</p>
                    <p className="text-sm text-slate-500">Authentic flavors from the heart of Nagaland.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                <h4 className="font-bold text-lg mb-4 border-b border-white/10 pb-2">Business Hours</h4>
                <div className="space-y-4">
                  <p className="flex items-center gap-3 text-sm text-slate-300">
                    <Phone className="w-4 h-4 text-blue-400" /> +91 98765 43210
                  </p>
                  <p className="flex items-center gap-3 text-sm text-slate-300">
                    <MapPin className="w-4 h-4 text-blue-400" /> {venue.location}
                  </p>
                </div>
                <Button className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  Enquire for Events
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}