"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom"
import { Loader2, Armchair } from 'lucide-react'

export default function SeatMap({ venueId }: { venueId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasSeats, setHasSeats] = useState(false)

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
      selection: false, // Disable group selection for mobile ease
      renderOnAddRemove: true,
    })

    // Load Background (Floor Plan)
    // In a real app, fetch this from venue.layout_url
    const bgImage = document.createElement('img')
    bgImage.src = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80' // Placeholder floor plan
    bgImage.onload = () => {
        const imgInstance = new fabric.Image(bgImage, { opacity: 0.5, selectable: false })
        imgInstance.scaleToWidth(600)
        canvas.backgroundImage = imgInstance
        canvas.requestRenderAll()
    }

    const addSeatToMap = (s: any) => {
      const circle = new fabric.Circle({
        radius: 18,
        fill: s.status === 'free' ? '#22c55e' : '#ef4444', // Green/Red
        stroke: '#fff',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 5 })
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
        hoverCursor: s.status === 'free' ? 'pointer' : 'not-allowed',
        selectable: true 
      })

      // @ts-ignore
      group.data = s
      canvas.add(group)
    }

    const fetchSeats = async () => {
      // FETCH SEATS FOR *THIS* VENUE ONLY
      const { data } = await supabase.from('seats').select('*').eq('venue_id', venueId)
      
      if (data && data.length > 0) {
        setHasSeats(true)
        data.forEach(s => addSeatToMap(s))
      }
      setLoading(false)
    }

    fetchSeats()

    // Touch/Click Event
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
      // In a real app, save intent and redirect to login
      alert("Please login to book a table!")
      window.location.href = "/login"
      return
    }

    // UPDATE STATUS
    const { error } = await supabase.from('seats')
        .update({ status: 'occupied', guest_name: session.user.email })
        .eq('id', selectedSeat.id)

    if (!error) {
        alert(`Table ${selectedSeat.label} Booked! Check "My Tickets".`)
        setIsModalOpen(false)
        window.location.reload() // Simple reload to refresh map state
    }
  }

  if (loading) return <div className="h-[400px] flex items-center justify-center bg-slate-100 rounded-xl"><Loader2 className="animate-spin text-slate-400"/></div>

  if (!hasSeats) return (
    <div className="h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <Armchair className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">No floor plan available yet.</p>
        <p className="text-xs text-slate-400">Venue owner hasn't digitized this floor.</p>
    </div>
  )

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="w-full bg-slate-50 p-2 text-center text-xs text-slate-500 border-b border-slate-100 flex justify-center gap-4">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Available</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Booked</span>
      </div>
      
      {/* ZOOM CONTAINER */}
      <div className="h-[400px] w-full relative overflow-hidden bg-slate-100 touch-none">
        <QuickPinchZoom onUpdate={onUpdate}>
            <div ref={contentRef} className="origin-top-left">
                <canvas ref={canvasRef} />
            </div>
        </QuickPinchZoom>
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full pointer-events-none">
            Pinch to Zoom
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle>Book Table {selectedSeat?.label}</DialogTitle>
            <DialogDescription>Reserve this spot for tonight?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={confirmBooking} className="w-full bg-green-600 hover:bg-green-700 font-bold py-6 rounded-xl">
                Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}