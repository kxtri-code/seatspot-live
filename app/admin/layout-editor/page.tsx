"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Upload, Circle as CircleIcon, Square, Trash2, Image as ImageIcon, CornerUpLeft } from 'lucide-react'
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom"
import { useRouter } from 'next/navigation'

export default function MobileLayoutEditor() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [venue, setVenue] = useState<any>(null)
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null)
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null)

  // 1. INIT & FETCH VENUE
  useEffect(() => {
    checkUserAndVenue()
  }, [])

  const checkUserAndVenue = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { data: v } = await supabase.from('venues').select('*').eq('owner_id', session.user.id).single()
    if (!v) { router.push('/list-venue'); return }
    
    setVenue(v)
    setBgImageUrl(v.layout_url || v.image_url) 
    setLoading(false)
  }

  // 2. SETUP CANVAS
  useEffect(() => {
    if (!canvasRef.current || loading || !venue) return

    const c = new fabric.Canvas(canvasRef.current, {
      height: window.innerHeight,
      width: window.innerWidth,
      backgroundColor: '#f8fafc',
      selection: false
    })
    setCanvas(c)

    loadBackgroundAndSeats(c, bgImageUrl, venue.id)

    // Event Listeners
    c.on('selection:created', (e) => setSelectedObject(e.selected[0]))
    c.on('selection:cleared', () => setSelectedObject(null))

    return () => { c.dispose() }
  }, [loading, venue, bgImageUrl])

  // --- FIXED FUNCTION FOR V6 ---
  const loadBackgroundAndSeats = async (c: fabric.Canvas, imgUrl: string | null, vId: string) => {
    c.clear()
    
    // A. Load Background Image (Fixed for Fabric v6)
    if (imgUrl) {
        try {
            // Fabric v6 returns a Promise
            const img = await fabric.Image.fromURL(imgUrl, { crossOrigin: 'anonymous' })
            
            img.set({
                selectable: false,
                evented: false,
            })
            
            // Scale image
            const scale = c.width! / img.width!
            img.scale(scale)
            
            c.add(img)
            c.sendObjectToBack(img) // Fixed: sendObjectToBack
            c.requestRenderAll()
        } catch (err) {
            console.error("Could not load background image", err)
        }
    }

    // B. Load Existing Seats
    const { data: seats } = await supabase.from('seats').select('*').eq('venue_id', vId)
    if (seats) {
        seats.forEach(seat => addShape(c, seat.x, seat.y, seat.label, seat.type, false))
    }
  }

  // 3. ACTIONS
  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !venue) return
    setUploading(true)
    try {
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${venue.id}/layout-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file)
        if (uploadError) throw uploadError
        
        const { data } = supabase.storage.from('images').getPublicUrl(fileName)
        
        await supabase.from('venues').update({ layout_url: data.publicUrl }).eq('id', venue.id)
        setBgImageUrl(data.publicUrl) 
    } catch (error: any) {
        alert("Upload failed: " + error.message)
    } finally {
        setUploading(false)
    }
  }

  const addShape = (c: fabric.Canvas, left: number, top: number, label: string, type: string, setActive = true) => {
    let shape: any
    const color = type === 'circle' ? '#22c55e' : '#3b82f6'

    if (type === 'circle') {
        shape = new fabric.Circle({ radius: 25, fill: color, stroke: '#fff', strokeWidth: 3, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 5 }) })
    } else {
        shape = new fabric.Rect({ width: 60, height: 60, fill: color, stroke: '#fff', strokeWidth: 3, rx: 8, ry: 8, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 5 }) })
    }

    const text = new fabric.Text(label, { fontSize: 16, fill: '#fff', fontWeight: 'bold', originX: 'center', originY: 'center' })
    const group = new fabric.Group([shape, text], { left, top, hasControls: false, padding: 5, transparentCorners: false, borderColor: '#fde047', cornerColor: '#fde047' })

    // @ts-ignore
    group.seatType = type
    
    c.add(group)
    if (setActive) c.setActiveObject(group)
    c.requestRenderAll()
  }

  // --- FIXED FUNCTION FOR V6 ---
  const addNew = (type: 'circle' | 'rect') => {
      if(!canvas) return
      
      // Fixed: getCenterPoint() returns {x, y} in v6
      const center = canvas.getCenterPoint() 
      const label = `T-${canvas.getObjects().length}`
      
      // Use center.x and center.y
      addShape(canvas, center.x, center.y, label, type)
  }

  const deleteSelected = () => {
      if(!canvas || !selectedObject) return
      canvas.remove(selectedObject)
      setSelectedObject(null)
      canvas.requestRenderAll()
  }

  const saveLayout = async () => {
    if (!canvas || !venue) return
    setSaving(true)

    // Filter out background image (which is usually an Image object, we want Groups)
    const seatsToSave = canvas.getObjects()
        .filter(obj => obj.type === 'group') 
        .map((obj: any, index) => ({
            venue_id: venue.id,
            x: obj.left,
            y: obj.top,
            label: `T-${index + 1}`,
            type: obj.seatType || 'circle',
            status: 'free',
            price: 500
        }))

    await supabase.from('seats').delete().eq('venue_id', venue.id)
    const { error } = await supabase.from('seats').insert(seatsToSave)

    if (error) alert("Save Failed: " + error.message)
    else router.push('/dashboard')
    
    setSaving(false)
  }

  const onUpdate = useCallback(({ x, y, scale }: any) => {
    if (contentRef.current) {
      contentRef.current.style.transform = make3dTransformValue({ x, y, scale });
    }
  }, []);


  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" /></div>

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden relative">
      
      {/* TOP BAR */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 z-20 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <CornerUpLeft className="text-slate-600" />
        </Button>
        <h1 className="font-bold text-slate-900">Floor Plan Editor</h1>
        <Button 
            onClick={saveLayout} 
            disabled={saving || uploading} 
            className={`rounded-full font-bold shadow-lg ${saving ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700 text-white'}`}
        >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}
        </Button>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 relative z-10 touch-none">
        <QuickPinchZoom onUpdate={onUpdate}>
            <div ref={contentRef} className="origin-top-left h-full w-full flex items-center justify-center">
                <canvas ref={canvasRef} />
                {!bgImageUrl && !uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <ImageIcon className="w-16 h-16 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium">Upload your floor plan to begin.</p>
                    </div>
                )}
                {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-30">
                        <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-2" />
                        <p className="text-blue-600 font-bold">Uploading Blueprint...</p>
                    </div>
                )}
            </div>
        </QuickPinchZoom>
      </div>

      {/* BOTTOM TOOLBAR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border border-slate-100 z-30">
        <div className="relative">
            <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-slate-300 text-slate-600 hover:bg-slate-50">
                <Upload className="w-5 h-5" />
            </Button>
            <input type="file" onChange={handleBgUpload} accept="image/*" disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
        
        <div className="w-px h-6 bg-slate-200"></div>

        <Button onClick={() => addNew('circle')} variant="outline" size="icon" className="rounded-full w-12 h-12 border-green-200 bg-green-50 text-green-600 hover:bg-green-100">
            <CircleIcon className="w-6 h-6" />
        </Button>
        <Button onClick={() => addNew('rect')} variant="outline" size="icon" className="rounded-full w-12 h-12 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100">
            <Square className="w-6 h-6" />
        </Button>

        {selectedObject && (
            <Button onClick={deleteSelected} size="icon" className="rounded-full w-12 h-12 bg-red-600 text-white hover:bg-red-700 shadow-md animate-in zoom-in duration-200">
                <Trash2 className="w-5 h-5" />
            </Button>
        )}
      </div>

    </div>
  )
}