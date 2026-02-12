"use client"

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, MousePointer2, Undo2, Image as ImageIcon } from 'lucide-react'

export default function LayoutEditor() {
  const [tables, setTables] = useState<any[]>([])
  const [layoutUrl, setLayoutUrl] = useState('https://images.unsplash.com/photo-1559339352-11d035aa65de') // Default Placeholder
  const [newLabel, setNewLabel] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePinTable = (e: React.MouseEvent) => {
    if (!containerRef.current || !newLabel) return alert("Enter a label (e.g. T1) first!")
    
    const rect = containerRef.current.getBoundingClientRect()
    const newTable = {
      id: crypto.randomUUID(), 
      label: newLabel,
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
      status: 'free',
      guest_name: null 
    }

    setTables([...tables, newTable])
    setNewLabel('') 
  }

  const saveToDatabase = async () => {
    // 1. Save the seats
    const { error: seatError } = await supabase.from('seats').insert(tables)
    
    // 2. Save the layout URL to the venue (In a real app, you'd fetch the venue ID dynamically)
    // await supabase.from('venues').update({ layout_url: layoutUrl }).eq('id', VENUE_ID)

    if (!seatError) {
        alert("Floor Plan & Pins Saved!")
        setTables([])
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 pt-24">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* CONTROL BAR */}
        <div className="bg-slate-800 p-6 rounded-[2rem] border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black uppercase italic">Floor Plan Digitizer</h2>
                    <p className="text-sm text-slate-400">Setup your venue map for guests.</p>
                </div>
                <Button onClick={saveToDatabase} className="bg-green-600 hover:bg-green-700 font-bold px-8">
                    <Save className="w-4 h-4 mr-2" /> SAVE LIVE MAP
                </Button>
            </div>

            <div className="flex gap-4 p-4 bg-black/20 rounded-xl">
                <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Step 1: Floor Plan Image URL</label>
                    <div className="flex gap-2">
                        <Input 
                            value={layoutUrl} 
                            onChange={(e) => setLayoutUrl(e.target.value)} 
                            className="bg-white/5 border-white/10 text-white text-xs" 
                            placeholder="https://..."
                        />
                        <Button size="icon" variant="ghost"><ImageIcon className="w-4 h-4 text-slate-400"/></Button>
                    </div>
                </div>
                <div className="w-48 space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Step 2: Table Label</label>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="e.g. A1" 
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="bg-white/5 border-white/10 text-white text-xs"
                        />
                        <Button onClick={() => setTables(tables.slice(0, -1))} size="icon" variant="ghost"><Undo2 className="w-4 h-4 text-slate-400"/></Button>
                    </div>
                </div>
            </div>
        </div>

        {/* THE INTERACTIVE MAP */}
        <div 
          ref={containerRef}
          onClick={handlePinTable}
          className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-crosshair bg-slate-950 mx-auto group"
          style={{ width: '100%', height: '500px' }}
        >
          <img 
            src={layoutUrl} 
            className="w-full h-full object-contain pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" 
            alt="Venue Floor Plan" 
          />
          
          {tables.map((table, i) => (
            <div 
              key={i}
              className="absolute w-8 h-8 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-in zoom-in"
              style={{ left: table.x - 16, top: table.y - 16 }}
            >
              {table.label}
            </div>
          ))}

          {tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 border border-white/10">
                    <MousePointer2 className="w-5 h-5" /> Click anywhere on the map to pin a table
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}