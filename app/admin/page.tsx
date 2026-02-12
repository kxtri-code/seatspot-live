"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Layout, Clock, UserCheck, Search, Filter } from 'lucide-react'
import AdminMap from '@/components/AdminMap'

export default function AdminDashboard() {
  const [activeTables, setActiveTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLiveStatus = async () => {
      // Real-time "God View" of all seats
      const { data } = await supabase.from('seats').select('*')
      if (data) setActiveTables(data)
      setLoading(false)
    }
    fetchLiveStatus()

    // Real-time synchronization [cite: 70]
    const channel = supabase.channel('floor_updates').on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'seats' }, () => {
        fetchLiveStatus()
    }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 pt-24">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* PANEL A: COMMAND CENTER CONTROLS [cite: 32] */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">Mission Control</h1>
              <p className="text-slate-400 text-sm">Live Floor Plan & Seating Management [cite: 34]</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-6 rounded-2xl transition-all">
                <Users className="w-5 h-5 mr-2" /> New Walk-in [cite: 36]
              </Button>
              <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white py-6 rounded-2xl">
                <Filter className="w-5 h-5" /> Filter
              </Button>
            </div>
          </div>

          {/* VISUAL MAP: The "Secret Sauce" [cite: 22] */}
          <div className="bg-slate-800 rounded-[2.5rem] border border-white/10 p-8 shadow-inner overflow-hidden flex justify-center min-h-[600px]">
             <AdminMap />
          </div>
        </div>

        {/* PANEL B: CRM & RECENT ACTIVITY (The "Digital Notebook") [cite: 39, 41] */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="bg-slate-800 border-white/10 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <UserCheck className="text-blue-500 w-5 h-5" /> VIP CRM Alert [cite: 44]
              </h3>
            </div>
            <CardContent className="p-6 space-y-6">
              {/* This mimics the "Customer Memory" scenario in your report [cite: 39] */}
              <div className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-blue-100">Rahul (VIP) [cite: 42, 44]</h4>
                  <Badge className="bg-blue-500 text-white text-[10px]">RECURRING</Badge>
                </div>
                <p className="text-xs text-blue-200">Prefers: Window Seats [cite: 46]</p>
                <p className="text-[10px] text-blue-300 mt-1 italic">Last ordered: Spicy Pasta & Mojito [cite: 47]</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Tables [cite: 34]</h4>
                {activeTables.filter(t => t.status === 'occupied').map(table => (
                  <div key={table.id} className="flex items-center justify-between group">
                    <div>
                      <p className="font-bold text-sm">Table {table.label}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-400" /> 45 mins seated [cite: 38]
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                      Checkout
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-[2rem] text-white shadow-xl">
             <h4 className="font-bold mb-2">Manager Tip</h4>
             <p className="text-xs text-white/70">Tables turn yellow after 90 minutes. Check Table 12 for turnover[cite: 38, 76].</p>
          </div>
        </div>

      </div>
    </div>
  )
}