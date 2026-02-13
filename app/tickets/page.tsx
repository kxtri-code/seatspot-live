"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Ticket as TicketIcon, Calendar, MapPin, QrCode, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MyTickets() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
          router.push('/login')
          return
      }

      // Fetch seats + venue details
      const { data, error } = await supabase
        .from('seats')
        .select(`
            *,
            venues ( name, location, image_url )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'occupied')

      if (data) setTickets(data)
      setLoading(false)
    }
    fetchTickets()
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-24 text-white">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
              <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <TicketIcon className="text-yellow-400" /> My Tickets
          </h1>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {tickets.length > 0 ? tickets.map((t) => (
            <div key={t.id} className="bg-white text-black rounded-3xl overflow-hidden relative shadow-2xl">
                {/* TICKET HEADER (Venue Image) */}
                <div className="h-32 bg-slate-200 relative">
                     {t.venues?.image_url && <img src={t.venues.image_url} className="w-full h-full object-cover opacity-80" />}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                     <div className="absolute bottom-3 left-4 text-white">
                         <h3 className="font-bold text-lg">{t.venues?.name}</h3>
                         <p className="text-xs opacity-80 flex items-center gap-1"><MapPin className="w-3 h-3"/> {t.venues?.location}</p>
                     </div>
                </div>

                {/* TICKET BODY */}
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-center">
                            <p className="text-xs text-slate-400 font-bold uppercase">Seat</p>
                            <p className="text-3xl font-black text-slate-900">{t.label}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-slate-400 font-bold uppercase">Price</p>
                            <p className="text-xl font-bold text-green-600">₹{t.price}</p>
                        </div>
                        <div className="text-center">
                             <p className="text-xs text-slate-400 font-bold uppercase">Date</p>
                             <p className="text-sm font-bold text-slate-900">Tonight</p>
                        </div>
                    </div>

                    {/* QR CODE AREA */}
                    <div className="border-t-2 border-dashed border-slate-200 pt-6 flex flex-col items-center">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                             <QrCode className="w-32 h-32 text-slate-900" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Scan at entrance • ID: {t.id.slice(0,8)}</p>
                    </div>
                </div>

                {/* DECORATIVE CIRCLES */}
                <div className="absolute top-[128px] -left-3 w-6 h-6 bg-slate-950 rounded-full" />
                <div className="absolute top-[128px] -right-3 w-6 h-6 bg-slate-950 rounded-full" />
            </div>
        )) : (
            <div className="text-center py-20 opacity-50">
                <TicketIcon className="w-16 h-16 mx-auto mb-4" />
                <p>No tickets yet.</p>
                <Link href="/explore" className="text-yellow-400 underline mt-2 block">Find a party?</Link>
            </div>
        )}
      </div>
    </div>
  )
}