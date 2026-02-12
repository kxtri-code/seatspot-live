"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom"

export default function SeatMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentRef = useRef<HTMLDivElement>(null) // Reference for the zooming container
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const canvasInstance = useRef<fabric.Canvas | null>(null)

  // Zoom Handler
  const onUpdate = useCallback(({ x, y, scale }: any) => {
    const { current: content } = contentRef;
    if (content) {
      content.style.transform = make3dTransformValue({ x, y, scale });
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      height: 400,
      width: 600, // Matches your layout image size
      backgroundColor: '#f3f4f6',
      selection: false,
    })
    canvasInstance.current = canvas

    // Load Background Image (The "Photo" of the floor plan) [cite: 26]
    const bgImage = document.createElement('img')
    bgImage.src = '/layout.jpg'
    bgImage.onload = () => {
        const imgInstance = new fabric.Image(bgImage, { opacity: 0.5 })
        imgInstance.scaleToWidth(600)
        canvas.backgroundImage = imgInstance
        canvas.requestRenderAll()
    }

    const addSeatToMap = (s: any) => {
      // Logic to draw "invisible click zones" [cite: 27]
      const existing = canvas.getObjects().find((obj: any) => obj.data?.id === s.id)
      if (existing) return 

      const circle = new fabric.Circle({
        radius: 20,
        fill: s.status === 'free' ? '#22c55e' : '#ef4444', // Green for Go, Red for Stop [cite: 24]
        originX: 'center',
        originY: 'center',
      })

      const text = new fabric.Text(s.label, {
        fontSize: 10,
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
      })

      // @ts-ignore
      group.data = { id: s.id, label: s.label, status: s.status }
      canvas.add(group)
    }

    // Real-time updates [cite: 70]
    const fetchSeats = async () => {
      const { data } = await supabase.from('seats').select('*')
      if (data) data.forEach((s) => addSeatToMap(s))
    }
    fetchSeats()

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
  }, [])

  const confirmBooking = async () => {
    if (!selectedSeat) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      alert("Please login to book!")
      window.location.href = "/login"
      return
    }
    await supabase.from('seats').update({ status: 'occupied', guest_name: session.user.email }).eq('id', selectedSeat.id)
    setIsModalOpen(false)
  }

  return (
    <div className="flex flex-col items-center bg-white rounded-xl shadow-lg overflow-hidden">
      {/* The Pinch-to-Zoom Wrapper */}
      <div className="h-[400px] w-full bg-slate-100 relative overflow-hidden touch-none">
        <QuickPinchZoom onUpdate={onUpdate}>
            <div ref={contentRef} className="origin-top-left">
                <canvas ref={canvasRef} />
            </div>
        </QuickPinchZoom>
      </div>

      <div className="p-4 flex gap-4 text-sm font-bold w-full justify-center border-t">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-full"></div> Available</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-full"></div> Occupied</div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Book Table {selectedSeat?.label}</DialogTitle></DialogHeader>
          <p>Reserve this spot for your upcoming night out?</p>
          <DialogFooter>
            <Button onClick={confirmBooking} className="bg-blue-600 text-white">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}