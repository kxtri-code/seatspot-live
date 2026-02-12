"use client"

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, MousePointer2, Trash2, Undo2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid' // You might need to install this: npm install uuid

export default function LayoutEditor() {
  const [tables, setTables] = useState<any[]>([])
  const [layoutImage, setLayoutImage] = useState('/layout.jpg') 
  const [newLabel, setNewLabel] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePinTable = (e: React.MouseEvent) => {
    if (!containerRef.current || !newLabel) {
        alert("Enter a label first (e.g. T1)")
        return
    }
    
    const rect = containerRef.current.getBoundingClientRect()
    // 1. Round coordinates to fix the Integer error
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)

    const newTable = {
      // 2. Generate ID manually to fix "null value in column id" error
      // If you don't have 'uuid' installed, use crypto.randomUUID()
      id: crypto.randomUUID(), 
      label: newLabel,
      x: x,
      y: y,
      status: 'free',
      guest_name: null 
    }

    setTables([...tables, newTable])
    setNewLabel('') 
  }

  const undoLast = () => setTables(tables.slice(0, -1))

  const saveToDatabase = async () => {
    // 3. Send the fixed data
    const { error } = await supabase.from('seats').insert(tables)
    
    if (!error) {
        alert("Floor plan published successfully!")
        setTables([])
    } else {
        alert("Database Error: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 pt-24">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-slate-800 p-6 rounded-[2rem] border border-white/10">
          <div>
             <h2 className="text-2xl font-black uppercase italic">Floor Plan Digitizer</h2>
             <p className="text-sm text-slate-400">Pin tables to create the digital map.</p>
          </div>
          <div className="flex gap-4">
            <Input 
              placeholder="Label (e.g. A1)" 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-32 bg-white/10 border-white/20 text-white"
            />
            <Button onClick={undoLast} variant="ghost" className="text-slate-400 hover:text-white">
              <Undo2 className="w-5 h-5" />
            </Button>
            <Button onClick={saveToDatabase} className="bg-green-600 hover:bg-green-700 font-bold">
              <Save className="w-4 h-4 mr-2" /> PUBLISH FLOOR
            </Button>
          </div>
        </div>

        <div 
          ref={containerRef}
          onClick={handlePinTable}
          className="relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-crosshair bg-slate-800 mx-auto"
          style={{ width: '600px', height: '400px' }}
        >
          <img 
            src={layoutImage} 
            className="w-full h-full object-cover opacity-60 pointer-events-none" 
            alt="Floor Plan" 
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
                <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-2 border border-white/10">
                    <MousePointer2 className="w-5 h-5" /> Click map to pin table
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}