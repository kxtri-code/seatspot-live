"use client"

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, MousePointer2 } from 'lucide-react'

export default function LayoutEditor() {
  const [tables, setTables] = useState<any[]>([])
  // In a real app, you would upload this image to Supabase Storage first
  const [layoutImage, setLayoutImage] = useState('/layout.jpg') 
  const [newLabel, setNewLabel] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePinTable = (e: React.MouseEvent) => {
    if (!containerRef.current || !newLabel) {
        alert("Please enter a Table Label (e.g. T1) before clicking.")
        return
    }
    
    // Calculate click position relative to the image
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newTable = {
      label: newLabel,
      x: x,
      y: y,
      status: 'free'
    }

    setTables([...tables, newTable])
    setNewLabel('') 
  }

  const saveToDatabase = async () => {
    // Saves these coordinates to the 'seats' table
    const { error } = await supabase.from('seats').insert(tables)
    if (!error) {
        alert("Floor plan updated! Guests can now see these tables.")
        setTables([])
    } else {
        alert("Error: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-[2rem] border border-white/10">
          <div>
             <h2 className="text-2xl font-black uppercase italic">Floor Plan Digitizer</h2>
             <p className="text-sm text-slate-400">Step 1: Enter Label. Step 2: Click Map. Step 3: Save.</p>
          </div>
          <div className="flex gap-4">
            <Input 
              placeholder="Label (e.g. A1)" 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-32 bg-white/10 border-white/20 text-white"
            />
            <Button onClick={saveToDatabase} className="bg-green-600 hover:bg-green-700 font-bold">
              <Save className="w-4 h-4 mr-2" /> PUBLISH
            </Button>
          </div>
        </div>

        {/* The "Sheet of Plastic" Overlay [cite: 28] */}
        <div 
          ref={containerRef}
          onClick={handlePinTable}
          className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-crosshair bg-slate-800 mx-auto"
          style={{ width: '600px', height: '400px' }}
        >
          {/* This represents the "Photo" of the floor plan [cite: 26] */}
          <img 
            src={layoutImage} 
            className="w-full h-full object-cover opacity-60 pointer-events-none" 
            alt="Floor Plan" 
          />
          
          {/* The Pins */}
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
                <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 border border-white/10">
                    <MousePointer2 className="w-5 h-5" /> Click anywhere to pin a table
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}