"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Badge } from '@/components/ui/badge'
import { Flame, Users, TrendingUp } from 'lucide-react'

type VenueStats = {
  venue_name: string
  total_seats: number
  occupied_seats: number
  occupancy_rate: number
}

export default function LiveHeatmap() {
  const [stats, setStats] = useState<VenueStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculateVibe = async () => {
      const { data: seats } = await supabase.from('seats').select('*')
      const { data: events } = await supabase.from('events').select('venue_name')

      if (seats && events) {
        const uniqueVenues = Array.from(new Set(events.map(e => e.venue_name)))
        
        const venueStats = uniqueVenues.map(name => {
          const total = 10; 
          const occupied = seats.filter(s => s.status === 'occupied').length
          const rate = (occupied / total) * 100

          return {
            venue_name: name || "Main Hall",
            total_seats: total,
            occupied_seats: occupied,
            occupancy_rate: rate > 100 ? 100 : rate
          }
        })
        setStats(venueStats.sort((a, b) => b.occupancy_rate - a.occupancy_rate))
      }
      setLoading(false)
    }

    calculateVibe()
    const channel = supabase.channel('heatmap_updates').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'seats' }, () => {
        calculateVibe()
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Calculating city vibes...</div>

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Flame className="text-orange-500 w-6 h-6 animate-bounce" /> Live Pulse
        </h3>
        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 animate-pulse">LIVE</Badge>
      </div>

      <div className="space-y-6">
        {stats.map((venue, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-sm font-bold text-slate-800">{venue.venue_name}</span>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-tighter">
                  <Users className="w-3 h-3" /> {venue.occupied_seats} Guests
                </p>
              </div>
              <span className={`text-[10px] font-black ${venue.occupancy_rate > 70 ? 'text-orange-600' : 'text-blue-600'}`}>
                {Math.round(venue.occupancy_rate)}% CAPACITY
              </span>
            </div>
            
            {/* NO IMPORT NEEDED - CUSTOM BAR */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-in-out ${
                  venue.occupancy_rate > 80 ? 'bg-orange-500' : 
                  venue.occupancy_rate > 40 ? 'bg-blue-500' : 'bg-slate-300'
                }`}
                style={{ width: `${venue.occupancy_rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}