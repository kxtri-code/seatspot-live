"use client"

import { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { supabase } from '@/lib/supabaseClient'

export default function SeatMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasInstance = useRef<fabric.Canvas | null>(null)
  
  // State for the Popup
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [guestName, setGuestName] = useState("")

  useEffect(() => {
    if (!canvasRef.current) return

    // 1. Initialize Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      height: 400,
      width: 600,
      backgroundColor: '#f3f4f6',
      selection: false,
    })
    canvasInstance.current = canvas

    // 2. Function to Draw Tables
    const addTableToMap = (t: any) => {
      const existing = canvas.getObjects().find((obj: any) => obj.data?.id === t.id)
      if (existing) {
         // If it exists, just update the color
         const circle = (existing as any).getObjects()[0]
         circle.set('fill', t.status === 'free' ? '#22c55e' : '#ef4444')
         canvas.requestRenderAll()
         return
      }

      // Draw new table
      const circle = new fabric.Circle({
        radius: 30,
        fill: t.status === 'free' ? '#22c55e' : '#ef4444',
        stroke: '#15803d',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
      })

      const text = new fabric.Text(t.label, {
        fontSize: 14,
        fill: '#ffffff',
        fontFamily: 'Arial',
        originX: 'center',
        originY: 'center',
      })

      const group = new fabric.Group([circle, text], {
        left: t.x,
        top: t.y,
        hasControls: false,
        hoverCursor: 'pointer',
      })
      // @ts-ignore
      group.data = { id: t.id, label: t.label } 
      canvas.add(group)
    }

    // 3. Load Tables from DB
    const fetchTables = async () => {
      const { data } = await supabase.from('seats').select('*')
      if (data) data.forEach((t) => addTableToMap(t))
    }
    fetchTables()

    // 4. Realtime Listener
    const channel = supabase
      .channel('room1')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'seats' }, (payload) => {
        const updatedTable = payload.new as any
        const objects = canvas.getObjects() as any[]
        const group = objects.find((obj) => obj.data?.id === updatedTable.id)
        
        if (group) {
          const circle = group.getObjects()[0]
          circle.set('fill', updatedTable.status === 'free' ? '#22c55e' : '#ef4444')
          canvas.requestRenderAll()
        }
      })
      .subscribe()

    // 5. Handle Click -> Open Popup (Instead of auto-booking)
    canvas.on('mouse:down', (options) => {
      if (options.target && options.target.type === 'group') {
        const group = options.target as any
        const tableId = group.data.id
        const label = group.data.label
        
        // Only allow booking if it's FREE
        const circle = group.getObjects()[0]
        if (circle.fill === '#ef4444') {
          alert("This table is already taken!")
          return
        }

        // Open the "Booking Form"
        setSelectedTable({ id: tableId, label: label })
        setIsDialogOpen(true)
      }
    })

    return () => {
      canvas.dispose()
      supabase.removeChannel(channel)
    }
  }, [])

  // 6. The Function that runs when you click "Confirm Booking"
  const handleBooking = async () => {
    if (!selectedTable || !guestName) return

    // Send to Supabase
    await supabase
      .from('seats')
      .update({ status: 'occupied', guest_name: guestName })
      .eq('id', selectedTable.id)

    // Close Popup and Reset
    setIsDialogOpen(false)
    setGuestName("")
  }

  return (
    <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold">Live Booking System</h2>
      
      {/* Map */}
      <div className="border-4 border-gray-200 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} />
      </div>

      <p className="text-gray-500 text-sm">Tap a green table to book it.</p>

      {/* THE POPUP FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {selectedTable?.label}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="col-span-3"
                placeholder="Enter your name..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleBooking} className="bg-black text-white">
              Confirm Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}