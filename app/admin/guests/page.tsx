"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, UserCheck, Clock, CheckCircle, MapPin, Utensils, Star } from 'lucide-react'

export default function GuestList() {
  const [guests, setGuests] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    // Fetch all occupied seats (Bookings)
    // In a real app, you would filter by date = today
    const { data } = await supabase.from('seats').select('*').neq('status', 'free')
    if (data) setGuests(data)
    setLoading(false)
  }

  const handleCheckIn = async (seatId: string) => {
    // Mark as "Seated" or "Checked In"
    // For now, we just keep it occupied but verify the ticket
    alert("Guest Checked In! Table is marked as ACTIVE.")
  }

  const filteredGuests = guests.filter(g => 
    g.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.label?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-20 text-center text-slate-500">Loading Guest List...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pt-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-slate-900 p-8 rounded-[2rem] border border-white/10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-blue-500">Mission Control</h1>
            <p className="text-slate-400 mt-2">Tonight's Guest List & CRM</p>
          </div>
          <div className="w-full md:w-auto">
             <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <Input 
                    placeholder="Search Name or Table..." 
                    className="pl-12 bg-slate-800 border-slate-700 text-white w-full md:w-80 h-12 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* GUEST LIST */}
        <div className="grid gap-4">
            {filteredGuests.length > 0 ? (
                filteredGuests.map((seat) => (
                    <Card key={seat.id} className="bg-slate-900 border-slate-800 text-white overflow-hidden group hover:border-blue-500/50 transition-all">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                
                                {/* LEFT: TABLE INFO */}
                                <div className="bg-slate-800 p-6 flex flex-col justify-center items-center w-full md:w-40 shrink-0 border-r border-slate-700">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Table</span>
                                    <span className="text-5xl font-black text-white">{seat.label}</span>
                                    <Badge className="mt-2 bg-green-500 text-slate-900 font-bold">RESERVED</Badge>
                                </div>

                                {/* CENTER: GUEST CRM */}
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                                {seat.guest_name || 'Anonymous Guest'}
                                                {/* CRM LOGIC: If name contains 'rahul', show VIP badge (Simulated) */}
                                                {(seat.guest_name?.includes('rahul') || seat.guest_name?.includes('kxtri')) && (
                                                    <Badge className="bg-yellow-500 text-black hover:bg-yellow-400 flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-current" /> VIP GUEST
                                                    </Badge>
                                                )}
                                            </h3>
                                            <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                                                <Clock className="w-4 h-4" /> Booked for Tonight
                                            </p>
                                        </div>
                                    </div>

                                    {/* CRM INSIGHTS (Simulated based on doc) */}
                                    <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex gap-3">
                                            <div className="bg-blue-500/20 p-2 rounded-lg h-fit"><Utensils className="w-4 h-4 text-blue-400"/></div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-blue-300">Favorite Item</p>
                                                <p className="text-sm font-medium">Spicy Pasta & Mojito</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="bg-purple-500/20 p-2 rounded-lg h-fit"><MapPin className="w-4 h-4 text-purple-400"/></div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-purple-300">Seating Pref</p>
                                                <p className="text-sm font-medium">Window / Rooftop Edge</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: ACTIONS */}
                                <div className="p-6 flex flex-col justify-center gap-3 border-l border-slate-700 bg-slate-900/50">
                                    <Button onClick={() => handleCheckIn(seat.id)} className="w-full bg-green-600 hover:bg-green-700 font-bold py-6 text-lg shadow-lg shadow-green-900/20">
                                        <UserCheck className="w-5 h-5 mr-2" /> Check In
                                    </Button>
                                    <p className="text-[10px] text-center text-slate-500">Verify ID / QR Code</p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center py-20 bg-slate-900 rounded-3xl border border-dashed border-slate-800">
                    <UserCheck className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-slate-500">Guest List Empty</h3>
                    <p className="text-slate-600">No active bookings found for tonight.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}