"use client"

import { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Upload, Circle, Square, Trash2, Image as ImageIcon, ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MobileLayoutEditor() {
  const router = useRouter()
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [venue, setVenue] = useState<any>(null)
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)

  // 1. INIT & FETCH VENUE
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: v } = await supabase.from('venues').select('*').eq('owner_id', session.user.id).single()
      if (!v) { router.push('/list-venue'); return }
      
      setVenue(v)
      setLoading(false)
    }
    init()
  }, [])

  // 2. SETUP CANVAS
  useEffect(() => {
    if (!canvasEl.current || loading || !venue) return

    // Create a large virtual canvas for zooming/panning
    const c = new fabric.Canvas(canvasEl.current, {
      height: window.innerHeight,
      width: window.innerWidth,
      backgroundColor: '#f8fafc',
      selection: false, // Mobile friendly
    })
    setCanvas(c)

    // A. Load Background (Layout)
    const bgUrl = venue.layout_url || venue.image_url
    if (bgUrl) loadBackground(c, bgUrl)

    // B. Load Seats
    loadSeats(c, venue.id)

    // C. Selection Events
    c.on('selection:created', (e: any) => setSelectedObject(e.selected[0]))
    c.on('selection:cleared', () => setSelectedObject(null))

    // D. Touch/Drag Panning Logic
    let isDragging = false
    let lastPosX = 0
    let lastPosY = 0

    c.on('mouse:down', function(opt: any) {
      const evt = opt.e;
      if (opt.target) return // If clicking a table, don't pan
      
      isDragging = true;
      c.selection = false;
      // Handle both Mouse and Touch events safely
      lastPosX = evt.clientX || (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
      lastPosY = evt.clientY || (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
    });

    c.on('mouse:move', function(opt: any) {
      if (isDragging) {
        const evt = opt.e;
        
        // FIX: Use 'c' instead of 'this'
        const vpt = c.viewportTransform;
        if (!vpt) return;

        const currX = evt.clientX || (evt.touches && evt.touches[0] ? evt.touches[0].clientX : 0);
        const currY = evt.clientY || (evt.touches && evt.touches[0] ? evt.touches[0].clientY : 0);
        
        vpt[4] += currX - lastPosX;
        vpt[5] += currY - lastPosY;
        
        c.requestRenderAll(); // FIX: Use 'c' instead of 'this'
        lastPosX = currX;
        lastPosY = currY;
      }
    });

    c.on('mouse:up', function() {
      // FIX: Use 'c' instead of 'this'
      if(c.viewportTransform) {
         c.setViewportTransform(c.viewportTransform);
      }
      isDragging = false;
      c.selection = true; // FIX: Use 'c' instead of 'this'
    });

    // Zoom on pinch/wheel
    c.on('mouse:wheel', function(opt: any) {
      const delta = opt.e.deltaY;
      let zoom = c.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.5) zoom = 0.5;
      
      // Use fabric.Point for v6 compatibility
      c.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    return () => { c.dispose() }
  }, [loading, venue])


  // --- HELPERS ---
  const loadBackground = async (c: fabric.Canvas, url: string) => {
    try {
        const img = await fabric.Image.fromURL(url, { crossOrigin: 'anonymous' })
        
        img.set({ selectable: false, evented: false })
        
        // Scale image to fit properly if too huge
        if(img.width! > c.width!) {
             img.scaleToWidth(c.width!)
        }
        
        c.add(img)
        c.sendObjectToBack(img) 
        c.requestRenderAll()
    } catch(e) { console.error("BG Load Error", e) }
  }

  const loadSeats = async (c: fabric.Canvas, vid: string) => {
     const { data: seats } = await supabase.from('seats').select('*').eq('venue_id', vid)
     if(seats) seats.forEach(s => addShape(c, s.x, s.y, s.label, s.type, false))
  }

  // --- ACTIONS ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !venue) return
    setUploading(true)
    try {
        const file = e.target.files[0]
        const ext = file.name.split('.').pop()
        const path = `${venue.id}/blueprint-${Date.now()}.${ext}`
        
        const { error } = await supabase.storage.from('images').upload(path, file)
        if(error) throw error
        
        const { data } = supabase.storage.from('images').getPublicUrl(path)
        
        // Save to DB and Reload
        await supabase.from('venues').update({ layout_url: data.publicUrl }).eq('id', venue.id)
        if(canvas) {
            canvas.clear() 
            loadBackground(canvas, data.publicUrl) 
            loadSeats(canvas, venue.id) 
        }
    } catch (err:any) { alert(err.message) }
    setUploading(false)
  }

  const addShape = (c: fabric.Canvas, left: number, top: number, label: string, type: string, setActive = true) => {
    const fill = type === 'circle' ? '#22c55e' : '#3b82f6'
    let shape: any
    
    if (type === 'circle') shape = new fabric.Circle({ radius: 25, fill, stroke: '#fff', strokeWidth: 3 })
    else shape = new fabric.Rect({ width: 60, height: 60, fill, stroke: '#fff', strokeWidth: 3, rx: 8 })

    const text = new fabric.Text(label, { fontSize: 16, fill: '#fff', fontWeight: 'bold', originX: 'center', originY: 'center' })
    const group = new fabric.Group([shape, text], { left, top, hasControls: false, padding: 5 })
    
    // @ts-ignore
    group.seatType = type
    
    c.add(group)
    if(setActive) c.setActiveObject(group)
    c.requestRenderAll()
  }

  const addNew = (type: 'circle' | 'rect') => {
      if(!canvas) return
      // Use getCenterPoint for v6
      const center = canvas.getCenterPoint() 
      const label = `T-${canvas.getObjects().length}`
      addShape(canvas, center.x, center.y, label, type)
  }

  const doSave = async () => {
      if(!canvas || !venue) return
      setSaving(true)
      
      const seats = canvas.getObjects()
        .filter((o:any) => o.type === 'group')
        .map((o:any, i) => ({
            venue_id: venue.id,
            x: o.left,
            y: o.top,
            label: `T-${i+1}`,
            type: o.seatType || 'circle',
            status: 'free',
            price: 500
        }))

      await supabase.from('seats').delete().eq('venue_id', venue.id)
      await supabase.from('seats').insert(seats)
      
      setSaving(false)
      router.push('/dashboard')
  }

  // --- RENDER ---
  if (loading) return <div className="h-dvh flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="h-dvh w-screen bg-slate-50 overflow-hidden relative flex flex-col">
      
      {/* 1. TOP BAR (Fixed Z-Index) */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex items-center justify-between px-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="text-slate-900"/>
        </Button>
        <span className="font-bold text-slate-900">Edit Floor Plan</span>
        <Button onClick={doSave} size="sm" className="bg-slate-900 text-white font-bold rounded-full">
            {saving ? <Loader2 className="animate-spin w-4 h-4"/> : "Save"}
        </Button>
      </div>

      {/* 2. CANVAS LAYER */}
      <div className="flex-1 w-full relative z-0 mt-16">
         <canvas ref={canvasEl} className="w-full h-full block" />
         
         {/* Helper Text if Empty */}
         {!venue.layout_url && !uploading && canvas?.getObjects().length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
                 <ImageIcon className="w-12 h-12 text-slate-400 mb-2"/>
                 <p className="text-sm font-bold text-slate-500">Upload Blueprint to Start</p>
             </div>
         )}
      </div>

      {/* 3. FLOATING TOOLBAR (Fixed Bottom Center) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-3 bg-slate-900/90 backdrop-blur-md rounded-full shadow-2xl z-50 ring-1 ring-white/20">
            
            {/* Upload Button */}
            <div className="relative">
                <Button size="icon" className="rounded-full w-12 h-12 bg-white text-slate-900 hover:bg-slate-200">
                    {uploading ? <Loader2 className="animate-spin"/> : <Upload className="w-5 h-5"/>}
                </Button>
                <input 
                    type="file" 
                    onChange={handleUpload} 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploading}
                />
            </div>

            <div className="w-px h-6 bg-white/20"></div>

            {/* Add Table */}
            <Button onClick={() => addNew('circle')} size="icon" className="rounded-full w-12 h-12 bg-green-500 text-white hover:bg-green-600">
                <Circle className="w-6 h-6" />
            </Button>
            
            {/* Add Booth */}
            <Button onClick={() => addNew('rect')} size="icon" className="rounded-full w-12 h-12 bg-blue-500 text-white hover:bg-blue-600">
                <Square className="w-6 h-6" />
            </Button>

            {/* Delete (Contextual) */}
            {selectedObject && (
                <Button onClick={() => { canvas?.remove(selectedObject); setSelectedObject(null) }} size="icon" className="rounded-full w-12 h-12 bg-red-600 text-white animate-in zoom-in">
                    <Trash2 className="w-5 h-5" />
                </Button>
            )}
      </div>

    </div>
  )
}