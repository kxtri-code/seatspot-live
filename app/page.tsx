"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation' 
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Ticket, Globe, List, Search, MapPin, Star, Flame, ArrowRight } from 'lucide-react'
import Link from 'next/link' 
import VenueCard from '@/components/VenueCard'

export default function Home() {
  const [featuredVenues, setFeaturedVenues] = useState<any[]>([])
  const [allVenues, setAllVenues] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Featured (Top of page)
      const { data: featured } = await supabase.from('venues').select('*').eq('is_featured', true).limit(3)
      if (featured) setFeaturedVenues(featured)

      // 2. Fetch All (For list)
      const { data: all } = await supabase.from('venues').select('*')
      if (all) setAllVenues(all)
    }
    fetchData()
  }, [])

  const filteredVenues = allVenues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <main className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* 1. HERO & SEARCH */}
      <div className="bg-slate-900 text-white pt-32 pb-12 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <Badge className="bg-blue-600 hover:bg-blue-700 px-4 py-1 mb-4">DIMAPUR EDITION</Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
                Where is the <span className="text-blue-500">Vibe?</span>
            </h1>
            
            <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input 
                    placeholder="Find cafes, rooftops, or secret spots..." 
                    className="w-full pl-14 py-8 bg-white/10 border-white/20 text-white rounded-2xl text-lg backdrop-blur-md focus:bg-white/20 transition-all placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        
        {/* 2. FEATURED CAROUSEL (Horizontal Scroll) */}
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x">
            {featuredVenues.map((venue) => (
                <div key={venue.id} className="min-w-[85%] md:min-w-[400px] snap-center">
                    <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex gap-4 items-center cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                            <img src={venue.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <Badge variant="secondary" className="mb-1 text-[10px] uppercase font-bold text-blue-600">Featured</Badge>
                            <h3 className="font-bold text-lg leading-tight">{venue.name}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{venue.description}</p>
                        </div>
                        <div className="ml-auto bg-slate-50 p-3 rounded-full">
                            <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* 3. TRENDING & NEARBY */}
        <div className="mt-8 mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-black flex items-center gap-2">
                <Flame className="text-orange-500 fill-orange-500 w-6 h-6 animate-pulse" /> Trending Now
            </h2>
            <Link href="/map-view" className="text-blue-600 font-bold text-sm flex items-center gap-1">
                View on Map <MapPin className="w-4 h-4" />
            </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
            ))}
        </div>

        {/* 4. CALL TO ACTION FOR OWNERS */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-black mb-4">Own a Venue in Dimapur?</h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">Get listed on SeatSpot, manage your bookings, and reach thousands of local customers instantly.</p>
                <Link href="/list-venue">
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-6 px-8 rounded-xl text-lg">
                        List Your Venue
                    </Button>
                </Link>
            </div>
        </div>

      </div>
    </main>
  );
}