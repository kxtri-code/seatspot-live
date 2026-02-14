"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Loader2, Scan, Users, Settings, LogOut, CheckCircle, XCircle, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VenueDashboard() {
  const [loading, setLoading] = useState(true)
  const [venue, setVenue] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [scanResult, setScanResult] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  
  // Scanner Ref
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    checkVenueAccess()
  }, [])

  const checkVenueAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return window.location.href = '/login'

    // 1. Get Venue linked to this user
    // (For this demo, we will just fetch the FIRST venue if they are a 'venue_admin')
    // In production, you would filter by 'owner_id'
    const { data: venueData } = await supabase.from('venues').select('*').limit(1).single()
    
    if (venueData) {
        setVenue(venueData)
        fetchBookings(venueData.id)
    }
    setLoading(false)
  }

  const fetchBookings = async (venueId: string) => {
      // Fetch bookings for TODAY
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('venue_id', venueId)
        .gte('date', today)
        .order('date', { ascending: true })
      
      if (data) setBookings(data)
  }

  // --- QR SCANNER LOGIC ---
  const startScanner = () => {
      setIsScanning(true)
      setScanResult(null)
      
      // Slight delay to let UI render the div
      setTimeout(() => {
          const scanner = new Html5QrcodeScanner(
              "reader", 
              { fps: 10, qrbox: 250 },
              false
          )
          
          scanner.render(onScanSuccess, (err) => console.log(err))
          scannerRef.current = scanner
      }, 100)
  }

  const onScanSuccess = async (decodedText: string) => {
      if (scannerRef.current) {
          scannerRef.current.clear()
          setIsScanning(false)
      }

      // Verify Ticket in DB
      const ticketId = decodedText.split('ID: ')[1]?.trim() || decodedText
      
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single()

      if (error || !data) {
          setScanResult({ success: false, msg: "Invalid Ticket" })
      } else if (data.status === 'used') {
          setScanResult({ success: false, msg: "Already Used!" })
      } else {
          // Success! Mark as used
          await supabase.from('tickets').update({ status: 'used' }).eq('id', ticketId)
          setScanResult({ success: true, ticket: data })
          // Refresh list
          fetchBookings(venue.id)
      }
  }

  const stopScanner = () => {
      if (scannerRef.current) {
          scannerRef.current.clear()
          setIsScanning(false)
      }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-900"/></div>

  if (!venue) return <div className="p-10 text-center">No Venue Assigned. Contact Super Admin.</div>

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-40">
          <div>
              <h1 className="text-xl font-black text-slate-900">{venue.name}</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Partner Portal
              </p>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400">
              <LogOut className="w-5 h-5" />
          </Button>
      </div>

      <div className="p-6 max-w-lg mx-auto">
          
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="w-full bg-white p-1 rounded-xl border border-slate-200 mb-6 shadow-sm grid grid-cols-2">
                <TabsTrigger value="scan" className="font-bold">Scanner</TabsTrigger>
                <TabsTrigger value="guests" className="font-bold">Guest List</TabsTrigger>
            </TabsList>

            {/* TAB 1: SCANNER */}
            <TabsContent value="scan" className="space-y-6">
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
                    {!isScanning && !scanResult && (
                        <div className="py-10">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Scan className="w-10 h-10" />
                            </div>
                            <h3 className="font-black text-slate-900 text-lg mb-2">Ready to Scan</h3>
                            <p className="text-sm text-slate-500 mb-6">Point camera at guest's QR code</p>
                            <Button onClick={startScanner} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-blue-200">
                                Open Camera
                            </Button>
                        </div>
                    )}

                    {/* CAMERA CONTAINER */}
                    {isScanning && (
                        <div>
                            <div id="reader" className="rounded-xl overflow-hidden border-2 border-slate-900 mb-4" />
                            <Button variant="outline" onClick={stopScanner} className="w-full">Cancel</Button>
                        </div>
                    )}

                    {/* RESULT CARD */}
                    {scanResult && (
                        <div className={`py-8 animate-in zoom-in duration-300 ${scanResult.success ? 'text-green-600' : 'text-red-500'}`}>
                            {scanResult.success ? <CheckCircle className="w-20 h-20 mx-auto mb-4" /> : <XCircle className="w-20 h-20 mx-auto mb-4" />}
                            <h2 className="text-2xl font-black mb-1">{scanResult.success ? "Access Granted" : "Access Denied"}</h2>
                            <p className="font-bold text-slate-900 mb-6">{scanResult.msg || `${scanResult.ticket.admit_count} Guests • ${scanResult.ticket.guest_name}`}</p>
                            
                            <Button onClick={() => setScanResult(null)} className="bg-slate-900 text-white w-full rounded-xl">Scan Next</Button>
                        </div>
                    )}
                </div>

            </TabsContent>

            {/* TAB 2: GUEST LIST */}
            <TabsContent value="guests" className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <Input placeholder="Search guest name..." className="border-none bg-transparent h-auto p-0 focus-visible:ring-0" />
                </div>

                <div className="space-y-3">
                    {bookings.map((b) => (
                        <div key={b.id} className={`p-4 rounded-2xl border flex justify-between items-center ${b.status === 'used' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'}`}>
                            <div>
                                <h4 className="font-bold text-slate-900">{b.guest_name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">{b.admit_count} Ppl</span>
                                    <span className="text-[10px] text-slate-400 font-mono uppercase">{b.id.slice(0,6)}</span>
                                </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${b.status === 'used' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </div>
                    ))}
                    {bookings.length === 0 && <div className="text-center py-10 text-slate-400">No bookings for today.</div>}
                </div>
            </TabsContent>
          </Tabs>

      </div>
    </div>
  )
}