"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, CheckCircle } from 'lucide-react'

export default function GuestMenu() {
  const { tableId } = useParams()
  const [cart, setCart] = useState<any[]>([])
  const [ordered, setOrdered] = useState(false)

  const menuItems = [
    { name: 'Spicy Pasta', price: 12, desc: 'House special with chili flakes [cite: 47]' },
    { name: 'Axone Wings', price: 8, desc: 'Local Naga fermented soya bean sauce' },
    { name: 'Classic Mojito', price: 6, desc: 'Fresh mint and lime [cite: 47]' }
  ]

  const submitOrder = async () => {
    const { error } = await supabase.from('orders').insert([{
      table_id: tableId,
      items: cart,
      status: 'pending'
    }])

    if (!error) {
      setOrdered(true)
      setCart([])
    }
  }

  if (ordered) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
      <CheckCircle className="text-green-600 w-20 h-20 mb-4" />
      <h1 className="text-2xl font-black">Order Received!</h1>
      <p className="text-slate-500">Table {tableId}, your food is being prepared[cite: 65].</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-slate-900 text-white p-8 pt-12 rounded-b-[2.5rem]">
        <Badge className="bg-blue-600 mb-2">TABLE {tableId}</Badge>
        <h1 className="text-3xl font-black italic tracking-tight">The SkyDeck Menu [cite: 55]</h1>
      </div>

      <div className="p-6 space-y-4">
        {menuItems.map((item, i) => (
          <Card key={i} className="p-5 rounded-3xl border-none shadow-sm flex justify-between items-center bg-white">
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-xs text-slate-500 mb-2">{item.desc}</p>
              <p className="text-blue-600 font-black">${item.price}</p>
            </div>
            <Button onClick={() => setCart([...cart, item])} className="bg-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white rounded-2xl font-bold">
              Add +
            </Button>
          </Card>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 bg-slate-900 p-5 rounded-[2rem] shadow-2xl flex items-center justify-between text-white animate-in slide-in-from-bottom">
          <span className="font-black">{cart.length} Items Selected</span>
          <Button onClick={submitOrder} className="bg-blue-600 px-8 py-6 rounded-2xl font-black">
            Send Order [cite: 56]
          </Button>
        </div>
      )}
    </div>
  )
}