"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom"
import { Loader2 } from 'lucide-react'
import PaymentModal from './PaymentModal' // Import the Payment Gateway

export default function SeatMap({ venueId }: { venueId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // States
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPayment, setShowPayment] = useState(false) // NEW: Controls Payment Modal
  const [loading, setLoading] = useState(false) 

  // Zoom Handler
  const onUpdate = useCallback(({ x, y, scale }: any) => {
    if (contentRef.current) {
      contentRef.current.style.transform = make3dTransformValue({ x, y, scale });
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !venueId) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      height: 400,
      width: 600,
      selection: false,
      renderOnAddRemove: true,
    })

    // 1. ALWAYS LOAD BACKGROUND (Floor Plan)
    const bgImage = document.createElement('img')
    bgImage.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80'
    
    bgImage.onload = () => {
        const imgInstance = new fabric.Image(bgImage, { opacity: 0.6, selectable: false })
        imgInstance.scaleToWidth(600)
        canvas.backgroundImage = imgInstance
        canvas.requestRenderAll()
    }

    // 2. FETCH SEATS
    const fetchAndDrawSeats = async () => {
      const { data } = await supabase.from('seats').select('*').eq('venue_id', venueId)
      
      if (data) {
        data.forEach((s: any) => {
          const circle = new fabric.Circle({
            radius: 14,
            fill: s.status === 'free' ? '#22c55e' : '#ef4444', // Green if free, Red if taken
            stroke: 'white',
            strokeWidth: 2,
            originX: 'center',
            originY: 'center',
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 4 })
          })

          const text = new fabric.Text(s.label, {
            fontSize: 10,
            fontWeight: 'bold',
            fill: '#fff',
            originX: 'center',
            originY: 'center',
          })

          const group = new fabric.Group([circle, text], {
            left: s.x,
            top: s.y,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            selectable: true,
            hoverCursor: s.status === 'free' ? 'pointer' : 'not-allowed'
          })

          // @ts-ignore
          group.data = s
          canvas.add(group)
        })
      }
    }

    fetchAndDrawSeats()

    // 3. HANDLE CLICKS
    canvas.on('mouse:down', (options) => {
      if (options.target && options.target.type === 'group') {
        const group = options.target as any
        
        // Only allow clicking Free seats
        if (group.data.status === 'free') {
            setSelectedSeat(group.data)
            setIsModalOpen(true) // Open confirmation first
        }
      }
    })

    return () => { canvas.dispose() }
  }, [venueId])

  // --- NEW BOOKING LOGIC ---

  // 1. User clicks "Proceed to Pay"
  const handleBookingClick = async () => {
    if (!selectedSeat) return
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      alert("Please login to book a table!")
      window.location.href = "/login"
      return
    }

    // Close confirmation, Open Payment
    setIsModalOpen(false)
    setShowPayment(true)
  }

  // 2. Payment is Successful (Callback)
  const handlePaymentSuccess = async () => {
    setShowPayment(false) // Close payment modal
    
    const { data: { session } } = await supabase.auth.getSession()

    // Update DB to mark seat as Occupied
    const { error } = await supabase.from('seats')
        .update({ 
            status: 'occupied', 
            guest_name: session?.user?.email 
        })
        .eq('id', selectedSeat.id)

    if (!error) {
        // Redirect to Tickets page
        window.location.href = '/profile'
    } else {
        alert("Booking Error: " + error.message)
    }
  }

  return (
    <div className="flex flex-col items-center bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
      
      {/* MAP CONTAINER */}
      <div className="h-[400px] w-full relative overflow-hidden bg-slate-950 touch-none">
        <QuickPinchZoom onUpdate={onUpdate}>
            <div ref={contentRef} className="origin-top-left">
                <canvas ref={canvasRef} />
            </div>
        </QuickPinchZoom>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/70 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-md flex gap-3">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Available</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Booked</span>
            </div>
        </div>
      </div>

      {/* 1. CONFIRMATION DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Book Table {selectedSeat?.label}</DialogTitle>
            <DialogDescription>Reserve this spot for tonight?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleBookingClick} className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-4 rounded-xl">
                Proceed to Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. PAYMENT GATEWAY MODAL */}
      <PaymentModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        seat={selectedSeat}
        onSuccess={handlePaymentSuccess}
      />

    </div>
  )
}