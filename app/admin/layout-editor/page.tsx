"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { Save, Plus, Trash2, Armchair, Square, Circle as CircleIcon, RotateCw, Loader2 } from 'lucide-react'
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom"
import { useRouter } from 'next/navigation'

export default function LayoutEditor() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [venueId, setVenueId] = useState<string | null>(null)

  // 1. INITIALIZE CANVAS & FETCH VENUE
  useEffect(() => {
    if (!canvasRef.current) return

    // Setup Fabric Canvas
    const c = new fabric.Canvas(canvasRef.current, {
      height: 600,
      width: 800,
      backgroundColor: '#1e293b', // Slate-800
      selection: true
    })
    setCanvas(c)

    // Load User's Venue
    const fetchVenue = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
          router.push('/login')
          return
      }

      // Find the venue owned by this user
      const { data: venue } = await supabase
        .from('venues')
        .select('id')
        .eq('owner_id', session.user.id)
        .single()

      if (venue) {
        setVenueId(venue.id)
        loadExistingLayout(c, venue.id)
      } else {
        alert("No venue found! Please register your venue first.")
        router.push('/list-venue')
      }
      setLoading(false)
    }

    fetchVenue()

    return () => { c.dispose() }
  }, [])

  // 2. LOAD EXISTING SEATS (If any)
  const loadExistingLayout = async (c: fabric.Canvas, vId: string) => {
    const { data: seats } = await supabase.from('seats').select('*').eq('venue_id', vId)
    
    if (seats && seats.length > 0) {
        seats.forEach(seat => {
            addShapeToCanvas(c, seat.x, seat.y, seat.label, seat.type)
        })
    }
  }

  // 3. ADD SHAPE FUNCTION
  const addShapeToCanvas = (c: fabric.Canvas, left = 100, top = 100, label = 'T-1', type = 'circle') => {
    let shape: any

    if (type === 'circle') {
        shape = new fabric.Circle({ radius: 20, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 })
    } else {
        shape = new fabric.Rect({ width: 50, height: 50, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, rx: 4, ry: 4 })
    }

    const text = new fabric.Text(label, { fontSize: 14, fill: '#fff', fontWeight: 'bold', originX: 'center', originY: 'center' })
    
    const group = new fabric.Group([shape, text], {
        left, top,
        hasControls: true,
        selectable: true
    })

    // @ts-ignore
    group.seatType = type 
    // @ts-ignore
    group.seatLabel = label

    c.add(group)
    c.setActiveObject(group)
  }

  // 4. SAVE LAYOUT TO DB
  const saveLayout = async () => {
    if (!canvas || !venueId) return
    setSaving(true)

    const objects = canvas.getObjects()
    const seatsToSave = objects.map((obj: any, index) => ({
        venue_id: venueId,
        x: obj.left,
        y: obj.top,
        label: `T-${index + 1}`, // Auto-number tables
        type: obj.seatType || 'circle',
        status: 'free',
        price: 500
    }))

    // A. Delete old layout (Clean slate)
    await supabase.from('seats').delete().eq('venue_id', venueId)

    // B. Insert new layout
    const { error } = await supabase.from('seats').insert(seatsToSave)

    if (error) {
        alert("Save Failed: " + error.message)
    } else {
        alert("Layout Saved! You can now sell tickets.")
        router.push('/dashboard')
    }
    setSaving(false)
  }

  // CONTROLS
  const addTable = () => canvas && addShapeToCanvas(canvas, 100, 100, '?', 'circle')
  const addBooth = () => canvas && addShapeToCanvas(canvas, 150, 100, '?', 'rect')
  
  const deleteSelected = () => {
    const active = canvas?.getActiveObject()
    if (active) canvas?.remove(active)
  }

  const clearAll = () => {
      if(confirm("Clear entire floor plan?")) canvas?.clear()
  }

  // ZOOM HANDLER
  const onUpdate = useCallback(({ x, y, scale }: any) => {
    if (contentRef.current) {
      contentRef.current.style.transform = make3dTransformValue({ x, y, scale });
    }
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      
      {/* TOOLBAR */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900 z-50">
        <div className="font-bold text-lg flex items-center gap-2">
            <Armchair className="text-blue-500"/> Layout Editor
        </div>
        
        <div className="flex gap-2">
            <Button onClick={addTable} variant="secondary" size="sm" className="bg-slate-800 text-green-400 hover:bg-slate-700 border border-slate-700">
                <CircleIcon className="w-4 h-4 mr-2"/> Add Table
            </Button>
            <Button onClick={addBooth} variant="secondary" size="sm" className="bg-slate-800 text-blue-400 hover:bg-slate-700 border border-slate-700">
                <Square className="w-4 h-4 mr-2"/> Add Booth
            </Button>
            <div className="w-px h-8 bg-slate-700 mx-2"></div>
            <Button onClick={deleteSelected} variant="ghost" size="icon" className="text-red-400 hover:bg-red-900/20"><Trash2 className="w-5 h-5"/></Button>
            <Button onClick={clearAll} variant="ghost" size="icon" className="text-slate-400 hover:bg-slate-800"><RotateCw className="w-5 h-5"/></Button>
        </div>

        <Button onClick={saveLayout} disabled={saving} className="bg-blue-600 hover:bg-blue-500 font-bold min-w-[120px]">
            {saving ? <Loader2 className="animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
            {saving ? "Saving..." : "Save Layout"}
        </Button>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900">
        <QuickPinchZoom onUpdate={onUpdate}>
            <div ref={contentRef} className="origin-top-left p-10 flex items-center justify-center min-h-full">
                <div className="shadow-2xl shadow-black border border-slate-700 relative">
                    <canvas ref={canvasRef} />
                    <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono">CANVAS: 800x600</div>
                </div>
            </div>
        </QuickPinchZoom>
      </div>

    </div>
  )
}