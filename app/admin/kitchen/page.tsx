"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Printer, Clock, Utensils } from 'lucide-react'

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .neq('status', 'served')
        .order('created_at', { ascending: true })
      
      if (data) setOrders(data)
      setLoading(false)
    }

    fetchOrders()

    const channel = supabase
      .channel('kitchen_sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders(prev => [...prev, payload.new])
        // FIX: Only play audio in the browser
        if (typeof window !== 'undefined') {
            const audio = new Audio('/beep.mp3')
            audio.play().catch(() => console.log("Interaction needed for audio"))
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  }

  const printTicket = () => window.print()

  if (loading) return <div className="p-20 text-center text-slate-500">Connecting to Kitchen...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 bg-slate-900 p-6 rounded-3xl border border-white/10">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-orange-500 uppercase">Kitchen Display System</h1>
            <p className="text-slate-400 text-sm">Real-time order tickets</p>
          </div>
          <Badge className="bg-orange-600 text-white px-6 py-3 text-xl rounded-2xl animate-pulse">
            {orders.length} ACTIVE TICKETS
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {orders.map((order) => (
            <Card key={order.id} className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="bg-slate-800 p-5 flex justify-between items-center border-b border-white/5">
                <span className="font-black text-2xl">TABLE {order.table_id}</span>
                <Button size="sm" variant="ghost" onClick={printTicket} className="text-slate-400">
                  <Printer className="w-5 h-5 mr-2" /> PRINT
                </Button>
              </div>

              <CardContent className="p-6">
                <ul className="space-y-4 mb-8">
                  {order.items.map((item: any, i: number) => (
                    <li key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                      <span className="font-bold text-lg">{item.name}</span>
                      <Badge variant="outline" className="border-orange-500 text-orange-500">x1</Badge>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3">
                  {order.status === 'pending' ? (
                    <Button onClick={() => updateStatus(order.id, 'cooking')} className="w-full bg-yellow-600 py-8 text-xl font-black rounded-2xl">
                      START COOKING
                    </Button>
                  ) : (
                    <Button onClick={() => updateStatus(order.id, 'served')} className="w-full bg-green-600 py-8 text-xl font-black rounded-2xl">
                      MARK SERVED
                    </Button>
                  )}
                </div>
                <p className="text-center text-[10px] text-slate-500 mt-4 uppercase font-black tracking-widest">
                  <Clock className="w-3 h-3 inline mr-1" /> {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {orders.length === 0 && (
            <div className="text-center py-20 opacity-50">
                <Utensils className="w-20 h-20 mx-auto mb-4 text-slate-700" />
                <h2 className="text-2xl font-bold text-slate-700">Kitchen is Clear</h2>
            </div>
        )}
      </div>
    </div>
  )
}