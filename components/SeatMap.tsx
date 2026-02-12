"use client"

import { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function SeatMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedSeat, setSelectedSeat] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const canvasInstance = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      height: 400,
      width: 600,
      backgroundColor: '#f3f4f6',
      selection: false,
    })
    canvasInstance.current = canvas

    // Load Background Image (Optional: ensure layout.jpg is in /public)
    const bgImage = document.createElement('img')
    bgImage.src = '/layout.jpg'
    bgImage.onload = () => {
        const imgInstance = new fabric.Image(bgImage, { opacity: 0.3 })
        imgInstance.scaleToWidth(600)
        canvas.backgroundImage = imgInstance
        canvas.requestRenderAll()
    }

    const addSeatToMap = (s: any) => {
      const existing = canvas.getObjects().find((obj: any) => obj.data?.id === s.id)
      if (existing) {
         const circle = (existing as any).getObjects()[0]
         circle.set('fill', s.status === 'free' ? '#22c55e' : '#ef4444')
         canvas.requestRenderAll()
         return
      }

      const circle = new fabric.Circle({
        radius: 25,
        fill: s.status === 'free' ? '#22c55e' : '#ef4444',
        originX: 'center',
        originY: 'center',
      })

      const text = new fabric.Text(s.label, {
        fontSize: 12,
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

    const fetchSeats = async () => {
      const { data } = await supabase.from('seats').select('*')
      if (data) data.forEach((s) => addSeatToMap(s))
    }
    fetchSeats()

    const channel = supabase
      .channel('seat_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'seats' }, (payload) => {
        const updated = payload.new as any
        const objects = canvas.getObjects() as any[]
        const group = objects.find((obj) => obj.data?.id === updated.id)
        if (group) {
          const circle = group.getObjects()[0]
          circle.set('fill', updated.status === 'free' ? '#22c55e' : '#ef4444')
          group.hoverCursor = updated.status === 'free' ? 'pointer' : 'not-allowed'
          canvas.requestRenderAll()
        }
      })
      .subscribe()

    canvas.on('mouse:down', (options) => {
      if (options.target && options.target.type === 'group') {
        const group = options.target as any
        if (group.data.status === 'free') {
          setSelectedSeat(group.data)
          setIsModalOpen(true)
        }
      }
    })

    return () => {
      canvas.dispose()
      supabase.removeChannel(channel)
    }
  }, [])

  // --- UPDATED BOOKING LOGIC ---
  const confirmBooking = async () => {
    if (!selectedSeat) return

    // 1. Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      alert("Please login to book this table!")
      window.location.href = "/login"
      return
    }

    // 2. Use session email for guest_name automatically
    const { error } = await supabase
      .from('seats')
      .update({ 
        status: 'occupied', 
        guest_name: session.user.email 
      })
      .eq('id', selectedSeat.id)

    if (error) {
      alert("Error booking seat: " + error.message)
    } else {
      setIsModalOpen(false)
      setSelectedSeat(null)
    }
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-2xl">
      <div className="mb-4 flex gap-4 text-sm font-bold">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-full"></div> Available</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-full"></div> Booked</div>
      </div>

      <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Reservation</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-lg">Do you want to book <span className="font-bold">Table {selectedSeat?.label}</span>?</p>
            <p className="text-sm text-slate-500 mt-2">This will be linked to your account.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmBooking} className="bg-blue-600 text-white">Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}