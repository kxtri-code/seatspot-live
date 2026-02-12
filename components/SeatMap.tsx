"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom"
import { Loader2 } from 'lucide-react'

export default function SeatMap({ venueId }: { venueId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // FIX: Default loading to false so map shows immediately
  const [loading, setLoading] = useState(false) 

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
    // In production, this URL would come from the venue database
    bgImage.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80'
    
    bgImage.onload = () => {
        const imgInstance = new fabric.Image(bgImage, { opacity: 0.6, selectable: false })
        imgInstance.scaleToWidth(600)
        canvas.backgroundImage = imgInstance
        canvas.requestRenderAll()
    }

    // 2. FETCH SEATS (If they exist)
    const fetchAndDrawSeats = async () => {
      const { data } = await supabase.from('seats').select('*').eq('venue_id', venueId)
      
      if (data) {
        data.forEach((s: any) => {
          const circle = new fabric.Circle({
            radius: 14,
            fill: s.status === 'free' ? '#22c55e' : '#ef4444',
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
            hoverCursor: 'pointer'
          })

          // @ts-ignore
          group.data = s
          canvas.add(group)
        })
      }
    }

    fetchAndDrawSeats()

    canvas.on('mouse:down', (options) => {
      if (options.target && options.target.type === 'group') {
        const group = options.target as any
        if (group.data.status === 'free') {
            setSelectedSeat(group.data)
            setIsModalOpen(true)
        }
      }
    })

    return () => { canvas.dispose() }
  }, [venueId])

  const confirmBooking = async () => {
    if (!selectedSeat) return
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      alert("Please login to book!")
      window.location.href = "/login"
      return
    }

    const { error } = await supabase.from('seats')
        .update({ status: 'occupied', guest_name: session.user.email })
        .eq('id', selectedSeat.id)

    if (!error) {
        alert(`Table ${selectedSeat.label} Confirmed!`)
        setIsModalOpen(false)
        window.location.reload()
    }
  }

  return (
    <div className="flex flex-col items-center bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
      {/* ZOOM CONTAINER */}
      <div className="h-[400px] w-full relative overflow-hidden bg-slate-950 touch-none">
        <QuickPinchZoom onUpdate={onUpdate}>
            <div ref={contentRef} className="origin-top-left">
                <canvas ref={canvasRef} />
            </div>
        </QuickPinchZoom>
        
        {/* Helper Badge */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/70 text-white text-[10px] px-3 py-1.5 rounded-full backdrop-blur-md flex gap-3">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Available</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Booked</span>
            </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Book Table {selectedSeat?.label}</DialogTitle>
            <DialogDescription>Reserve this spot for tonight?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={confirmBooking} className="w-full bg-green-600 hover:bg-green-700 font-bold py-4 rounded-xl">
                Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}