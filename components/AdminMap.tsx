"use client"

import { useEffect, useRef, useState } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QRCode from "react-qr-code"

export default function AdminMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [showQR, setShowQR] = useState(false) // Controls the popup
  const canvasInstance = useRef<fabric.Canvas | null>(null)

  // Determine the Base URL (localhost or live)
  const [baseUrl, setBaseUrl] = useState("")

  useEffect(() => {
    // Set the URL only once the browser loads
    setBaseUrl(window.location.origin)
    
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      height: 400,
      width: 600,
      backgroundColor: '#e2e8f0',
      selection: false,
    })
    canvasInstance.current = canvas

    // Load Background Image
    const bgImage = document.createElement('img')
    bgImage.src = '/layout.jpg'
    bgImage.onload = () => {
        const imgInstance = new fabric.Image(bgImage, {
            opacity: 0.5,
        })
        imgInstance.scaleToWidth(600)
        canvas.backgroundImage = imgInstance
        canvas.requestRenderAll()
    }

    const addTableToMap = (t: any) => {
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
        stroke: '#000000',
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

    const fetchTables = async () => {
      const { data } = await supabase.from('seats').select('*')
      if (data) data.forEach((t) => addTableToMap(t))
    }
    fetchTables()

    const channel = supabase
      .channel('admin_room')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'seats' }, (payload) => {
        const updatedTable = payload.new as any
        const objects = canvas.getObjects() as any[]
        const group = objects.find((obj) => obj.data?.id === updatedTable.id)
        
        if (group) {
          const circle = group.getObjects()[0]
          circle.set('fill', updatedTable.status === 'free' ? '#22c55e' : '#ef4444')
          group.data.guest = updatedTable.guest_name
          canvas.requestRenderAll()
        }
      })
      .subscribe()

    canvas.on('mouse:down', (options) => {
      if (options.target && options.target.type === 'group') {
        const group = options.target as any
        setSelectedTable({
            id: group.data.id, 
            label: group.data.label,
            guest: group.data.guest 
        })
      }
    })

    return () => {
      canvas.dispose()
      supabase.removeChannel(channel)
    }
  }, [])

  const clearTable = async () => {
    if (!selectedTable) return
    await supabase.from('seats').update({ status: 'free', guest_name: null }).eq('id', selectedTable.id)
    setSelectedTable(null)
  }

  // Helper to print the QR Code
  const printQR = () => {
    const printWindow = window.open('', '', 'width=600,height=600')
    if (!printWindow) return

    // We get the SVG of the QR code
    const svg = document.getElementById("qr-code-svg")?.outerHTML

    printWindow.document.write(`
      <html>
        <head>
            <title>QR for ${selectedTable?.label}</title>
            <style>
                body { font-family: sans-serif; text-align: center; padding-top: 50px; }
                h1 { font-size: 40px; margin-bottom: 10px; }
                p { font-size: 20px; color: #666; }
            </style>
        </head>
        <body>
          <h1>${selectedTable?.label}</h1>
          <p>Scan to Order</p>
          <br/>
          ${svg}
          <br/><br/>
          <p>seatspot.com</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl shadow-lg border-2 border-black w-full max-w-4xl">
      <div className="flex justify-between w-full items-center">
         <h2 className="text-xl font-bold text-red-600">MANAGER DASHBOARD</h2>
         <div className="text-sm text-gray-500">Click a table to manage it</div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* The Map */}
        <div className="border-4 border-black rounded-lg overflow-hidden flex-1">
            <canvas ref={canvasRef} />
        </div>

        {/* The Control Panel */}
        <div className="w-full md:w-1/3 p-4 bg-gray-100 rounded-lg flex flex-col gap-4">
            {selectedTable ? (
                <>
                    <div className="text-center pb-4 border-b border-gray-300">
                        <p className="text-gray-500 text-sm uppercase">Selected</p>
                        <h3 className="text-3xl font-bold">{selectedTable.label}</h3>
                        {selectedTable.guest ? (
                            <p className="text-blue-600 font-bold mt-2">Occupied by: {selectedTable.guest}</p>
                        ) : (
                            <p className="text-green-600 font-bold mt-2">Available</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {selectedTable.guest && (
                             <Button onClick={clearTable} className="bg-red-600 hover:bg-red-700 text-white py-6 text-lg">
                                CLEAR TABLE
                             </Button>
                        )}
                        
                        <Button onClick={() => setShowQR(true)} variant="outline" className="py-6 text-lg border-black">
                            Show QR Code
                        </Button>
                    </div>
                </>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic">
                    Select a table on the map...
                </div>
            )}
        </div>
      </div>

      {/* THE QR POPUP */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
                <DialogTitle>QR Code for {selectedTable?.label}</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center p-6 bg-white">
                {selectedTable && baseUrl && (
                    <div className="p-4 border-4 border-black rounded-xl">
                        <QRCode 
                            id="qr-code-svg"
                            value={`${baseUrl}/menu/${selectedTable.id}`} 
                            size={200}
                        />
                    </div>
                )}
                <p className="mt-4 text-sm text-gray-500">
                    Directs to: {baseUrl}/menu/{selectedTable?.id}
                </p>
            </div>

            <Button onClick={printQR} className="w-full bg-black text-white">
                PRINT QR CODE
            </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}