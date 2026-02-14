"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, ArrowLeft, Ticket, Calendar, MapPin, QrCode, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function TicketsContent() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      // Fetch latest tickets first
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setTickets(data)
      setLoading(false)
    }
    fetchTickets()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 sticky top-0 z-50 border-b border-slate-100/50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/explore')} className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="text-slate-900"/>
            </Button>
            <h1 className="text-lg font-black text-slate-900">My Wallet</h1>
         </div>
         <div className="bg-slate-100 p-2 rounded-full">
             <Ticket className="w-5 h-5 text-slate-400" />
         </div>
      </div>

      <div className="p-4 space-y-6">
        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400"/></div>
        ) : tickets.length === 0 ? (
           <div className="text-center py-20 opacity-50">
               <Ticket className="w-16 h-16 mx-auto mb-4 text-slate-300" />
               <p className="font-bold text-slate-900">No Tickets Yet</p>
               <Button onClick={() => router.push('/explore')} variant="link" className="text-blue-600">Explore Events</Button>
           </div>
        ) : (
           tickets.map((t) => (
             <div key={t.id} className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 relative group">
                 {/* TICKET HEADER */}
                 <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-3 opacity-10">
                         <QrCode className="w-24 h-24" />
                     </div>
                     <h2 className="text-2xl font-black mb-1">{t.venue_name}</h2>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" /> Confirmed
                     </p>
                 </div>

                 {/* TICKET BODY */}
                 <div className="p-6">
                     <div className="flex justify-between items-center mb-6">
                         <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                             <p className="font-bold text-slate-900 flex items-center gap-1">
                                 <Calendar className="w-3 h-3 text-blue-500" /> 
                                 {new Date(t.date).toLocaleDateString()}
                             </p>
                         </div>
                         <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guests</p>
                             <p className="font-bold text-slate-900">{t.admit_count} People</p>
                         </div>
                     </div>

                     {/* QR CODE (Generated Real-time via API) */}
                     <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50">
                         <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t.id}`} 
                            className="w-32 h-32 mix-blend-multiply opacity-90"
                            alt="Ticket QR"
                         />
                         <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest">ID: {t.id.slice(0,8)}...</p>
                     </div>
                 </div>

                 {/* Perforated Edge Effect */}
                 <div className="absolute top-[88px] -left-3 w-6 h-6 bg-slate-50 rounded-full" />
                 <div className="absolute top-[88px] -right-3 w-6 h-6 bg-slate-50 rounded-full" />
             </div>
           ))
        )}
      </div>
    </div>
  )
}

export default function Tickets() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TicketsContent />
    </Suspense>
  )
}