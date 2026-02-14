"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

export default function SeatMap({ venueId, onSeatSelect }: { venueId: string, onSeatSelect: (seat: any) => void }) {
  const [seats, setSeats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSeats = async () => {
      // Fetch seats for this venue
      const { data } = await supabase.from('seats').select('*').eq('venue_id', venueId)
      
      // If no seats exist in DB, generate fake ones for the demo so it looks good
      if (!data || data.length === 0) {
        setSeats(generateDemoSeats())
      } else {
        setSeats(data)
      }
      setLoading(false)
    }
    fetchSeats()
  }, [venueId])

  const handleSeatClick = (seat: any) => {
    if (seat.status === 'occupied') return
    setSelectedSeatId(seat.id)
    onSeatSelect(seat)
  }

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-300"/></div>

  return (
    <div className="w-full overflow-x-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[300px] relative">
       {/* Stage / DJ Booth Indicator */}
       <div className="w-full h-8 bg-slate-200 rounded-lg mb-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-8">
          Stage / DJ Console
       </div>

       <div className="relative w-[300px] h-[300px] mx-auto">
          {seats.map((seat, i) => (
             <div
                key={i}
                onClick={() => handleSeatClick(seat)}
                className={`absolute transition-all cursor-pointer flex items-center justify-center text-[10px] font-bold shadow-sm
                  ${seat.status === 'occupied' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : ''}
                  ${selectedSeatId === seat.id ? 'bg-black text-white scale-110 shadow-lg ring-4 ring-black/10' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-500'}
                `}
                style={{
                    left: `${seat.x}px`,
                    top: `${seat.y}px`,
                    width: seat.type === 'rect' ? '60px' : '40px',
                    height: '40px',
                    borderRadius: seat.type === 'rect' ? '8px' : '50%'
                }}
             >
                {seat.label}
             </div>
          ))}
       </div>

       {/* Legend */}
       <div className="flex justify-center gap-4 mt-8 text-[10px] uppercase font-bold text-slate-400">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-white border border-slate-300"></div> Available</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-black"></div> Selected</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Booked</div>
       </div>
    </div>
  )
}

// Fallback generator so the map is never empty
function generateDemoSeats() {
    const seats = []
    // VIP Tables
    seats.push({ id: 'v1', x: 20, y: 20, type: 'rect', label: 'VIP-1', status: 'free', price: 2000 })
    seats.push({ id: 'v2', x: 220, y: 20, type: 'rect', label: 'VIP-2', status: 'occupied', price: 2000 })
    // Standard Tables
    seats.push({ id: 's1', x: 50, y: 100, type: 'circle', label: 'T-1', status: 'free', price: 1000 })
    seats.push({ id: 's2', x: 130, y: 100, type: 'circle', label: 'T-2', status: 'free', price: 1000 })
    seats.push({ id: 's3', x: 210, y: 100, type: 'circle', label: 'T-3', status: 'free', price: 1000 })
    // Booths
    seats.push({ id: 'b1', x: 20, y: 200, type: 'rect', label: 'B-1', status: 'free', price: 1500 })
    seats.push({ id: 'b2', x: 220, y: 200, type: 'rect', label: 'B-2', status: 'free', price: 1500 })
    return seats
}