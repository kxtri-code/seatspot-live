"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { 
  Loader2, Wallet, Ticket, Calendar, MapPin, 
  ChevronRight, Users, ArrowUpRight, ShieldCheck, Sparkles 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import QRCode from 'react-qr-code'

export default function MyWallet() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)

  useEffect(() => {
    const loadWallet = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      const [tData, wData] = await Promise.all([
        supabase.from('tickets').select('*, venues(name, location)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('wallets').select('balance').eq('user_id', user.id).single()
      ])

      if (tData.data) setTickets(tData.data)
      if (wData.data) setBalance(wData.data.balance)
      setLoading(false)
    }
    loadWallet()
  }, [router])

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-32">
      
      {/* 1. CINEMATIC HEADER */}
      <div className="p-8 pt-16 bg-gradient-to-b from-blue-600/20 to-transparent">
          <div className="flex justify-between items-start mb-8">
              <div>
                  <h1 className="text-3xl font-black tracking-tighter">My Wallet</h1>
                  <div className="flex items-center gap-2 mt-1">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">VIP Member</span>
                  </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-slate-400" />
              </div>
          </div>

          {/* BALANCE CARD */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Balance</p>
              <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter">₹{balance.toLocaleString()}</span>
                  <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              </div>
              <div className="flex gap-3 mt-8">
                  <Button className="flex-1 h-14 rounded-2xl bg-white text-black font-black hover:bg-slate-200 shadow-lg">
                      Top Up <ArrowUpRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl border-slate-700 bg-slate-800/50 font-black backdrop-blur-md">
                      Transfer
                  </Button>
              </div>
          </div>
      </div>

      {/* 2. TICKETS SECTION */}
      <div className="px-6 space-y-6">
          <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-black">Your Passes ({tickets.length})</h2>
              <Ticket className="w-5 h-5 text-slate-500" />
          </div>

          {tickets.length > 0 ? (
              tickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)}
                    className={`relative transition-all duration-500 cursor-pointer ${selectedTicket === ticket.id ? 'scale-[1.02]' : 'hover:scale-[0.98]'}`}
                  >
                      {/* TICKET FRONT */}
                      <div className={`bg-white text-slate-900 rounded-[2rem] overflow-hidden shadow-xl flex flex-col transition-all ${selectedTicket === ticket.id ? 'rounded-b-none' : ''}`}>
                          <div className="p-6 flex justify-between items-start">
                              <div>
                                  <h3 className="text-2xl font-black tracking-tight">{ticket.venues?.name || 'Venue'}</h3>
                                  <div className="flex items-center gap-2 mt-1 text-slate-500 font-bold text-sm">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {new Date(ticket.created_at).toDateString()}
                                  </div>
                              </div>
                              <div className="bg-slate-100 px-4 py-2 rounded-2xl text-center">
                                  <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Guests</p>
                                  <span className="text-xl font-black">{ticket.admit_count}</span>
                              </div>
                          </div>
                          
                          <div className="px-6 pb-6 flex justify-between items-end">
                              <div className="flex items-center gap-1 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                  <MapPin className="w-3 h-3" /> {ticket.venues?.location || 'Dimapur'}
                              </div>
                              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ticket.status === 'used' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                  {ticket.status || 'Confirmed'}
                              </div>
                          </div>

                          {/* Dotted Divider */}
                          <div className="relative h-4 border-t-2 border-dashed border-slate-100">
                              <div className="absolute -left-3 -top-2 w-6 h-6 bg-slate-950 rounded-full" />
                              <div className="absolute -right-3 -top-2 w-6 h-6 bg-slate-950 rounded-full" />
                          </div>
                      </div>

                      {/* TICKET REAR (QR CODE - FLIPS OPEN) */}
                      {selectedTicket === ticket.id && (
                          <div className="bg-white border-t border-slate-100 rounded-b-[2rem] p-8 flex flex-col items-center animate-in slide-in-from-top-4 duration-300">
                              <div className="p-4 bg-white border-4 border-slate-50 rounded-3xl shadow-inner">
                                  <QRCode 
                                    value={`ID: ${ticket.id}`} 
                                    size={180}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                  />
                              </div>
                              <p className="mt-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Scan at Entrance</p>
                              <p className="mt-1 font-mono text-xs text-slate-400">{ticket.id.split('-')[0]}</p>
                          </div>
                      )}
                  </div>
              ))
          ) : (
              <div className="text-center py-20 bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-800">
                  <Ticket className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No active passes found.</p>
                  <Button variant="link" onClick={() => router.push('/')} className="text-blue-500 mt-2">Go Explore &rarr;</Button>
              </div>
          )}
      </div>
    </div>
  )
}