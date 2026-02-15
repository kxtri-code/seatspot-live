"use client"

import { useState, useEffect } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, CheckCircle, XCircle, Users, Zap, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BouncerScanner() {
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, in: 0 })

  // Load stats on mount
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    // Count total confirmed/used tickets for today (simplified for demo)
    const { count: total } = await supabase.from('tickets').select('*', { count: 'exact', head: true })
    const { count: used } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'used')
    setStats({ total: total || 0, in: used || 0 })
  }

  const handleScan = async (detectedCodes: any[]) => {
    if (loading || !detectedCodes.length) return
    const rawValue = detectedCodes[0].rawValue
    
    // Extract ID (Assuming QR format is "ID: <uuid>")
    const ticketId = rawValue.replace('ID: ', '').trim()

    // Prevent double-scanning the same code instantly
    if (ticketId === lastScan) return
    
    setLastScan(ticketId)
    setLoading(true)

    try {
        // Call our Secure SQL Function
        const { data, error } = await supabase.rpc('check_in_ticket', { p_ticket_id: ticketId })
        
        if (error) throw error
        setResult(data)
        if (data.success) fetchStats() // Update counter
        
    } catch (err: any) {
        setResult({ success: false, message: "System Error: " + err.message })
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      
      {/* HEADER */}
      <div className="p-6 flex justify-between items-center bg-slate-900 border-b border-slate-800">
          <div>
              <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500 fill-blue-500" /> BOUNCER MODE
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Access Control</p>
          </div>
          <div className="text-right">
              <div className="flex items-center gap-2 justify-end text-green-400">
                  <Users className="w-4 h-4" />
                  <span className="text-xl font-black">{stats.in}</span>
                  <span className="text-sm text-slate-500 font-bold">/ {stats.total}</span>
              </div>
          </div>
      </div>

      {/* CAMERA VIEWPORT */}
      <div className="relative flex-1 bg-black flex flex-col items-center justify-center overflow-hidden">
          {!result ? (
              <div className="w-full max-w-sm aspect-square relative border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                  <Scanner 
                      onScan={handleScan} 
                      components={{ audio: false, finder: false }} // Clean UI
                      styles={{ container: { width: '100%', height: '100%' } }}
                  />
                  {/* Custom Overlay */}
                  <div className="absolute inset-0 border-[3px] border-blue-500/50 rounded-3xl m-8 animate-pulse pointer-events-none" />
                  <p className="absolute bottom-4 left-0 w-full text-center text-xs font-bold uppercase tracking-widest text-white/50">
                      Align QR Code
                  </p>
              </div>
          ) : (
              /* RESULT CARD (Success/Fail) */
              <div className={`w-full max-w-sm p-8 m-6 rounded-[2.5rem] text-center animate-in zoom-in duration-300 shadow-2xl ${result.success ? 'bg-green-500 text-black' : 'bg-red-600 text-white'}`}>
                  
                  {result.success ? (
                      <CheckCircle className="w-24 h-24 mx-auto mb-4 animate-bounce" />
                  ) : (
                      <XCircle className="w-24 h-24 mx-auto mb-4 animate-pulse" />
                  )}

                  <h2 className="text-4xl font-black uppercase mb-2">
                      {result.success ? "ACCESS GRANTED" : "DENIED"}
                  </h2>
                  <p className="text-lg font-bold opacity-80 mb-6 uppercase tracking-widest">
                      {result.message}
                  </p>

                  {result.success && (
                      <div className="bg-black/10 rounded-2xl p-4 mb-6 text-left space-y-2 backdrop-blur-sm">
                          <div>
                              <span className="text-[10px] font-bold uppercase opacity-60">Guest</span>
                              <p className="text-xl font-black">{result.guest}</p>
                          </div>
                          <div className="flex justify-between">
                              <div>
                                  <span className="text-[10px] font-bold uppercase opacity-60">Table</span>
                                  <p className="text-xl font-black">{result.seat}</p>
                              </div>
                              <div className="text-right">
                                  <span className="text-[10px] font-bold uppercase opacity-60">Admit</span>
                                  <p className="text-xl font-black">{result.admit}</p>
                              </div>
                          </div>
                      </div>
                  )}

                  <Button 
                      onClick={() => { setResult(null); setLastScan(null); }}
                      className="w-full h-16 rounded-2xl bg-black text-white font-bold text-lg shadow-xl"
                  >
                      <RotateCcw className="w-5 h-5 mr-2" /> Scan Next
                  </Button>
              </div>
          )}
      </div>

      {/* FOOTER */}
      <div className="p-6 bg-slate-900 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin w-3 h-3"/> Verifying Ticket...</span> : "Ready to Scan"}
          </p>
      </div>
    </div>
  )
}