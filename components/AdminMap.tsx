"use client"

import { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'

export default function AdminMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const canvasInstance = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      height: 400,
      width: 600,
      backgroundColor: '#e2e8f0', // Darker gray for Admin Mode
      selection: false,
    })
    canvasInstance.current = canvas

    // Function to Draw Tables
    const addTableToMap = (t: any) => {
      // Avoid duplicates
      const existing = canvas.getObjects().find((obj: any) => obj.data?.id === t.id)
      if (existing) {
         const circle = (existing as any).getObjects()[0]
         circle.set('fill', t.status === 'free' ? '#22c55e' : '#ef4444')
         canvas.requestRenderAll()
         return
      }

      const circle = new fabric.Circle({
        radius: 30,
        fill: t.status === 'free' ? '#22c55e' : '#ef4444',
        stroke: '#000000', // Black border for Admin
        strokeWidth: 3,
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
      group.data = { id: t.id, label: t.label, guest: t.guest_name } 
      canvas.add(group)
    }

    // Load Data
    const fetchTables = async () => {
      const { data } = await supabase.from('seats').select('*')
      if (data) data.forEach((t) => addTableToMap(t))
    }
    fetchTables()

    // Realtime Listener
    const channel = supabase
      .channel('admin_room')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'seats' }, (payload) => {
        const updatedTable = payload.new as any
        const objects = canvas.getObjects() as any[]
        const group = objects.find((obj) => obj.data?.id === updatedTable.id)
        
        if (group) {
          const circle = group.getObjects()[0]
          circle.set('fill', updatedTable.status === 'free' ? '#22c55e' : '#ef4444')
          // Update guest name data
          group.data.guest = updatedTable.guest_name
          canvas.requestRenderAll()
        }
      })
      .subscribe()

    // Handle Admin Clicks
    canvas.on('mouse:down', (options) => {
      if (options.target && options.target.type === 'group') {
        const group = options.target as any
        setSelectedTable({
            id: group.data.id, 
            label: group.data.label,
            guest: group.data.guest // We can see who sat there!
        })
      }
    })

    return () => {
      canvas.dispose()
      supabase.removeChannel(channel)
    }
  }, [])

  // ADMIN ACTION: Clear the table
  const clearTable = async () => {
    if (!selectedTable) return
    
    await supabase
      .from('seats')
      .update({ status: 'free', guest_name: null }) // Wipe the data
      .eq('id', selectedTable.id)
      
    setSelectedTable(null)
  }

  return (
    <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl shadow-lg border-2 border-black">
      <h2 className="text-xl font-bold text-red-600">MANAGER DASHBOARD</h2>
      
      <div className="border-4 border-black rounded-lg overflow-hidden">
        <canvas ref={canvasRef} />
      </div>

      <div className="p-4 bg-gray-100 w-full rounded text-center">
        <p className="text-gray-500 text-sm">Selected Table:</p>
        <h3 className="text-2xl font-bold mb-2">{selectedTable?.label || "None"}</h3>
        
        {selectedTable?.guest && (
            <p className="text-blue-600 font-bold mb-4">Guest: {selectedTable.guest}</p>
        )}

        <Button 
            onClick={clearTable} 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={!selectedTable}
        >
          CLEAR TABLE (Mark Free)
        </Button>
      </div>
    </div>
  )
}