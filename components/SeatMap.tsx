"use client"

import { useEffect, useState, useRef } from 'react'
import * as fabric from 'fabric' 
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Loader2, CheckCircle, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SeatMap({ venueId }: { venueId: string }) {
  const router = useRouter()
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    if (!canvasEl.current) return

    // Initialize Canvas
    // Cast as 'any' to bypass strict TS checks for this specific implementation
    const c: any = new fabric.Canvas(canvasEl.current, {
      height: 400,
      width: window.innerWidth < 600 ? window.innerWidth - 40 : 600, // Responsive width
      backgroundColor: '#f8fafc',
      selection: false,
    })
    setCanvas(c)

    loadSeats(c)

    // Click Handler
    c.on('mouse:down', (opt: any) => {
        if (opt.target && opt.target.type === 'group') {
            const seat = opt.target
            
            // Prevent booking if taken
            if (seat.seatStatus === 'occupied') {
                alert("This seat is already taken!")
                return
            }

            // Open Booking Drawer
            setSelectedSeat({
                id: seat.seatId,
                label: seat.seatLabel,
                price: seat.seatPrice || 500,
                category: seat.seatCategory
            })
            setIsDrawerOpen(true)
        }
    })

    return () => { c.dispose() }
  }, [venueId])

  const loadSeats = async (c: fabric.Canvas) => {
    const { data: seats } = await supabase.from('seats').select('*').eq('venue_id', venueId)
    
    if (seats) {
        c.clear()
        seats.forEach(s => {
            // Color Logic
            let color = '#22c55e' // Green (Free)
            if (s.status === 'occupied') color = '#94a3b8' // Grey (Taken)
            else if (s.category === 'vip') color = '#eab308' // Gold (VIP)
            else if (s.category === 'window') color = '#3b82f6' // Blue (Window)

            let shape: any
            if (s.type === 'circle') {
                shape = new fabric.Circle({ radius: 20, fill: color, stroke: 'white', strokeWidth: 2 })
            } else {
                shape = new fabric.Rect({ width: 50, height: 50, rx: 8, fill: color, stroke: 'white', strokeWidth: 2 })
            }

            const text = new fabric.Text(s.label, { fontSize: 12, fill: 'white', fontWeight: 'bold', originX: 'center', originY: 'center' })
            
            const group = new fabric.Group([shape, text], { 
                left: s.x, 
                top: s.y, 
                hasControls: false, 
                lockMovementX: true, 
                lockMovementY: true,
                hoverCursor: s.status === 'free' ? 'pointer' : 'not-allowed'
            })

            // Attach data to object so we can read it on click
            // @ts-ignore
            group.seatId = s.id; group.seatStatus = s.status; group.seatPrice = s.price; group.seatLabel = s.label; group.seatCategory = s.category;

            c.add(group)
        })
        c.renderAll()
    }
  }

  const handleBooking = async () => {
      setBooking(true)
      
      // 1. Check Login
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
          alert("Please login to book tickets!")
          router.push('/login')
          return
      }

      // 2. Book the Seat (Update DB)
      const { error } = await supabase
        .from('seats')
        .update({ status: 'occupied', user_id: session.user.id })
        .eq('id', selectedSeat.id)

      if (error) {
          alert("Booking failed: " + error.message)
      } else {
          setIsDrawerOpen(false)
          router.push('/tickets?success=true') // Redirect to tickets page
      }
      setBooking(false)
  }

  return (
    <div className="w-full flex justify-center bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
      <canvas ref={canvasEl} />

      {/* BOOKING DRAWER */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>Confirm Booking</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                        <p className="text-sm text-slate-500">Seat</p>
                        <h3 className="text-2xl font-black text-slate-900">{selectedSeat?.label}</h3>
                        <span className="text-xs uppercase font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">{selectedSeat?.category}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Price</p>
                        <h3 className="text-2xl font-black text-green-600">₹{selectedSeat?.price}</h3>
                    </div>
                </div>

                <Button onClick={handleBooking} disabled={booking} className="w-full py-8 text-lg font-bold bg-slate-900 text-white rounded-xl shadow-xl hover:bg-slate-800">
                    {booking ? <Loader2 className="animate-spin mr-2" /> : <CreditCard className="mr-2" />}
                    {booking ? "Processing..." : "Pay & Book"}
                </Button>
            </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}