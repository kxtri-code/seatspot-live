"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Users, CheckCircle, XCircle, RefreshCw, LogOut, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, revenue: 0 })
  const [search, setSearch] = useState('')

  const fetchBookings = async () => {
    setLoading(true)
    // In a real app, you'd filter by the logged-in venue owner's ID
    // For this demo, we fetch ALL tickets so you can see your test data
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
        setTickets(data)
        
        // Calculate Stats
        const checkedInCount = data.filter(t => t.status === 'used').length
        // Assuming average revenue per head is approx ₹500 for demo logic
        const rev = data.reduce((acc, curr) => acc + (curr.admit_count * 500), 0)
        
        setStats({
            total: data.reduce((acc, curr) => acc + curr.admit_count, 0),
            checkedIn: checkedInCount,
            revenue: rev
        })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // HANDLER: Check In a Guest
  const handleCheckIn = async (ticketId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'confirmed' ? 'used' : 'confirmed'
      
      // Update DB
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)

      if (!error) {
          // Update Local State (Optimistic UI)
          setTickets(prev => prev.map(t => 
              t.id === ticketId ? { ...t, status: newStatus } : t
          ))
      }
  }

  // Filter Logic
  const filteredTickets = tickets.filter(t => 
      t.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.id.includes(search)
  )

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      
      {/* ADMIN HEADER */}
      <div className="bg-slate-900 text-white p-6 pb-12">
          <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-black">SeatSpot Admin</h1>
              <Button variant="ghost" size="icon" onClick={() => router.push('/explore')} className="text-white/50 hover:text-white hover:bg-white/10">
                  <LogOut className="w-5 h-5" />
              </Button>
          </div>
          
          {/* STATS GRID */}
          <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                  <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Guests</div>
                  <div className="text-2xl font-black">{stats.total}</div>
              </div>
              <div className="bg-green-500/20 backdrop-blur-md p-4 rounded-2xl border border-green-500/30">
                  <div className="text-green-200 text-[10px] font-bold uppercase tracking-widest mb-1">Checked In</div>
                  <div className="text-2xl font-black text-green-100">{stats.checkedIn}</div>
              </div>
              <div className="bg-blue-500/20 backdrop-blur-md p-4 rounded-2xl border border-blue-500/30">
                  <div className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">Revenue</div>
                  <div className="text-2xl font-black text-blue-100">₹{stats.revenue.toLocaleString()}</div>
              </div>
          </div>
      </div>

      {/* GUEST LIST CONTAINER */}
      <div className="px-4 -mt-6">
          <div className="bg-white rounded-t-[2rem] min-h-[500px] shadow-xl border border-slate-200/60 p-6">
              
              {/* SEARCH BAR */}
              <div className="relative mb-6">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search guest name or ID..." 
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
              </div>

              {/* LIST HEADER */}
              <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-slate-900">Today's Guests</h2>
                  <Button variant="ghost" size="sm" onClick={fetchBookings}>
                      <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
              </div>

              {/* LOADING STATE */}
              {loading && (
                  <div className="py-20 flex justify-center">
                      <Loader2 className="animate-spin text-slate-300 w-8 h-8" />
                  </div>
              )}

              {/* TICKETS LIST */}
              {!loading && (
                  <div className="space-y-4">
                      {filteredTickets.length > 0 ? filteredTickets.map((t) => (
                          <div 
                            key={t.id} 
                            className={`p-4 rounded-2xl border transition-all ${t.status === 'used' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}
                          >
                              <div className="flex justify-between items-center">
                                  <div>
                                      <h3 className="font-bold text-slate-900">{t.guest_name}</h3>
                                      <p className="text-xs text-slate-500 font-medium">
                                          {t.venue_name} • <span className="text-slate-900 font-bold">{t.seat_label || 'General'}</span>
                                      </p>
                                      <div className="flex items-center gap-2 mt-2">
                                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-bold">
                                              {t.admit_count} Guests
                                          </span>
                                          <span className="text-[10px] text-slate-300 font-mono">
                                              ID: {t.id.slice(0,6)}
                                          </span>
                                      </div>
                                  </div>

                                  {/* CHECK IN BUTTON */}
                                  <button 
                                    onClick={() => handleCheckIn(t.id, t.status)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${t.status === 'used' ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white shadow-lg'}`}
                                  >
                                      {t.status === 'used' ? <CheckCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6 opacity-50" />}
                                  </button>
                              </div>
                          </div>
                      )) : (
                          <div className="text-center py-10 text-slate-400">
                              <p>No guests found.</p>
                          </div>
                      )}
                  </div>
              )}
          </div>
      </div>
    </div>
  )
}