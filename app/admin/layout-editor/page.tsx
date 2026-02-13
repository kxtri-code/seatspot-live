"use client"

import { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Hand, MousePointer2, Armchair } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Slider } from "@/components/ui/slider"

export default function ProLayoutEditor() {
  const router = useRouter()
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [venue, setVenue] = useState<any>(null)
  const [mode, setMode] = useState<'pan' | 'edit'>('pan')
  const [selectedSeat, setSelectedSeat] = useState<fabric.Object | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // Edit State
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState('standard')
  const [size, setSize] = useState(1)

  // 1. INIT
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')
      const { data: v } = await supabase.from('venues').select('*').eq('owner_id', session.user.id).single()
      setVenue(v)
    }
    init()
  }, [])

  // 2. CANVAS SETUP
  useEffect(() => {
    if (!canvasEl.current || !venue) return

    // Cast to 'any' to allow custom properties like 'isDragging' without TS errors
    const c: any = new fabric.Canvas(canvasEl.current, {
      height: window.innerHeight,
      width: window.innerWidth,
      backgroundColor: '#f8fafc',
      selection: false,
    })
    setCanvas(c)

    // Load BG (Fixed for v6)
    const bgUrl = venue.layout_url || venue.image_url
    if (bgUrl) {
      fabric.Image.fromURL(bgUrl, { crossOrigin: 'anonymous' }).then((img) => {
        img.set({ selectable: false, evented: false })
        if(img.width! > c.width!) img.scaleToWidth(c.width!)
        c.add(img)
        c.sendObjectToBack(img)
        c.requestRenderAll()
      })
    }

    // Load Seats
    const loadSeats = async () => {
        const { data } = await supabase.from('seats').select('*').eq('venue_id', venue.id)
        if(data) data.forEach(s => addShape(c, s.x, s.y, s.label, s.type, s.category || 'standard'))
    }
    loadSeats()

    // --- INTERACTION LOGIC ---
    c.on('mouse:down', (opt: any) => {
      const evt = opt.e;
      if (mode === 'pan') {
        c.isDragging = true;
        c.lastPosX = evt.clientX || evt.touches?.[0].clientX;
        c.lastPosY = evt.clientY || evt.touches?.[0].clientY;
      } else {
        // Edit Mode
        if (opt.target && opt.target.type === 'group') {
            const obj = opt.target as any
            setSelectedSeat(obj)
            setLabel(obj.seatLabel)
            setCategory(obj.seatCategory || 'standard')
            setSize(obj.scaleX || 1)
            setIsDrawerOpen(true)
        }
      }
    });

    c.on('mouse:move', (opt: any) => {
      if (mode === 'pan' && c.isDragging) {
        const evt = opt.e;
        const vpt = c.viewportTransform!;
        vpt[4] += (evt.clientX || evt.touches?.[0].clientX) - c.lastPosX;
        vpt[5] += (evt.clientY || evt.touches?.[0].clientY) - c.lastPosY;
        c.requestRenderAll();
        c.lastPosX = evt.clientX || evt.touches?.[0].clientX;
        c.lastPosY = evt.clientY || evt.touches?.[0].clientY;
      }
    });

    c.on('mouse:up', () => {
      c.setViewportTransform(c.viewportTransform!);
      c.isDragging = false;
    });

    return () => c.dispose()
  }, [venue, mode])

  // 3. HELPERS
  const addShape = (c: fabric.Canvas, x: number, y: number, lbl: string, type: string, cat: string) => {
    let shape: any
    let color = '#3b82f6' // Default Blue
    if (cat === 'vip') color = '#eab308' // Gold
    if (cat === 'window') color = '#22c55e' // Green
    if (cat === 'couple') color = '#ec4899' // Pink

    if (type === 'circle') shape = new fabric.Circle({ radius: 25, fill: color, stroke: 'white', strokeWidth: 2 })
    else shape = new fabric.Rect({ width: 50, height: 50, rx: 8, fill: color, stroke: 'white', strokeWidth: 2 })

    const text = new fabric.Text(lbl, { fontSize: 14, fill: 'white', fontWeight: 'bold', originX: 'center', originY: 'center' })
    const group = new fabric.Group([shape, text], { left: x, top: y, hasControls: false, padding: 0 })
    
    // @ts-ignore
    group.seatLabel = lbl; group.seatType = type; group.seatCategory = cat;

    c.add(group)
    c.requestRenderAll()
  }

  const addNew = () => {
    if(!canvas) return
    const center = canvas.getVpCenter() // v6 method
    addShape(canvas, center.x, center.y, `T-${canvas.getObjects().length}`, 'rect', 'standard')
  }

  const updateSelected = () => {
      if(!selectedSeat || !canvas) return
      
      // Update Props
      // @ts-ignore
      selectedSeat.seatLabel = label; selectedSeat.seatCategory = category;
      
      const group = selectedSeat as fabric.Group
      const shape = group.getObjects()[0] as any
      const text = group.getObjects()[1] as fabric.Text
      
      text.set('text', label)
      
      let color = '#3b82f6'
      if (category === 'vip') color = '#eab308'
      if (category === 'window') color = '#22c55e'
      if (category === 'couple') color = '#ec4899'
      shape.set('fill', color)

      group.scale(size)
      
      canvas.requestRenderAll()
      setIsDrawerOpen(false)
  }

  const deleteSelected = () => {
      if(selectedSeat && canvas) {
          canvas.remove(selectedSeat)
          setIsDrawerOpen(false)
      }
  }

  const saveLayout = async () => {
      if(!canvas || !venue) return
      const seats = canvas.getObjects().filter((o:any) => o.type === 'group').map((o:any) => ({
          venue_id: venue.id,
          x: o.left, y: o.top,
          label: o.seatLabel,
          type: o.seatType,
          category: o.seatCategory,
          status: 'free',
          price: o.seatCategory === 'vip' ? 1000 : 500
      }))

      await supabase.from('seats').delete().eq('venue_id', venue.id)
      await supabase.from('seats').insert(seats)
      router.push('/dashboard')
  }

  return (
    <div className="h-dvh w-screen bg-slate-50 overflow-hidden relative">
      
      {/* TOP BAR */}
      <div className="fixed top-0 w-full h-16 bg-white shadow-sm flex items-center justify-between px-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft /></Button>
        
        {/* MODE SWITCHER */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setMode('pan')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'pan' ? 'bg-white shadow text-black' : 'text-slate-500'}`}>
                <Hand className="w-4 h-4 inline mr-1"/> Pan
            </button>
            <button onClick={() => setMode('edit')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'edit' ? 'bg-white shadow text-black' : 'text-slate-500'}`}>
                <MousePointer2 className="w-4 h-4 inline mr-1"/> Edit
            </button>
        </div>

        <Button onClick={saveLayout} size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-full">Save</Button>
      </div>

      {/* CANVAS */}
      <canvas ref={canvasEl} className="block w-full h-full" />

      {/* ADD BUTTON (Only in Edit Mode) */}
      {mode === 'edit' && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2">
              <Button onClick={addNew} className="rounded-full h-14 px-8 shadow-2xl bg-slate-900 text-white font-bold text-lg">
                  <Armchair className="mr-2"/> Add Table
              </Button>
          </div>
      )}

      {/* EDIT DRAWER */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>Edit Table Details</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-6">
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">TABLE NUMBER / NAME</label>
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} className="text-lg font-bold" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">CATEGORY</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['standard', 'vip', 'window', 'couple'].map((cat) => (
                            <div 
                                key={cat} 
                                onClick={() => setCategory(cat)}
                                className={`p-3 rounded-lg border-2 text-center uppercase text-xs font-bold cursor-pointer ${category === cat ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100'}`}
                            >
                                {cat}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">SIZE SCALE: {size.toFixed(1)}x</label>
                    <Slider value={[size]} min={0.5} max={2} step={0.1} onValueChange={(v) => setSize(v[0])} />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button onClick={deleteSelected} variant="destructive" className="flex-1 py-6 rounded-xl">Delete</Button>
                    <Button onClick={updateSelected} className="flex-1 py-6 rounded-xl bg-green-600 hover:bg-green-700 text-white">Save Changes</Button>
                </div>
            </div>
        </DrawerContent>
      </Drawer>

    </div>
  )
}