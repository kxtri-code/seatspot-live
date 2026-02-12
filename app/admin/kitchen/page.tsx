"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Printer } from 'lucide-react' // Import Printer Icon

type OrderItem = {
  id: string
  menu_item_id: string
  quantity: number
  item_name: string
}

type Order = {
  id: string
  table_id: string
  status: string
  total_amount: number
  created_at: string
  items?: OrderItem[]
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])

  // Fetch Orders
  const fetchOrders = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .neq('status', 'served')
      .order('created_at', { ascending: true })

    if (ordersData) {
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id)
          return { ...order, items: items || [] }
        })
      )
      setOrders(ordersWithItems)
    }
  }

  // Realtime Listener
  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel('kitchen_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  }

  // THE PRINT FUNCTION
  const printTicket = (order: Order) => {
    // 1. Create a temporary hidden iframe or div to hold the receipt
    const printWindow = window.open('', '', 'width=600,height=600')
    if (!printWindow) return

    // 2. Generate the HTML for the Receipt
    const itemsHtml = order.items?.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>${item.quantity}x ${item.item_name}</span>
      </div>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${order.id.slice(0, 4)}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; width: 300px; }
            h2, h3 { text-align: center; margin: 5px 0; }
            .divider { border-top: 1px dashed black; margin: 10px 0; }
            .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h2>SEATSPOT</h2>
          <h3>Table ${order.table_id}</h3>
          <p>Time: ${new Date(order.created_at).toLocaleTimeString()}</p>
          <div class="divider"></div>
          ${itemsHtml}
          <div class="divider"></div>
          <div class="total">TOTAL: $${order.total_amount}</div>
          <br/>
          <center>*** KITCHEN COPY ***</center>
        </body>
      </html>
    `)

    // 3. Trigger Print
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">KITCHEN DISPLAY (KDS)</h1>
        <div className="text-xl font-mono text-green-400">
          LIVE • {orders.length} Active Tickets
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className={`border-l-8 ${order.status === 'pending' ? 'border-l-red-500' : 'border-l-yellow-500'} bg-slate-800 text-slate-100 shadow-xl`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-3xl font-bold">Table {order.table_id}</CardTitle>
                <Badge className={order.status === 'pending' ? "bg-red-500" : "bg-yellow-500"}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                #{order.id.slice(0, 4)} • {new Date(order.created_at).toLocaleTimeString()}
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 my-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-lg border-b border-slate-700 pb-1">
                    <span className="font-bold">{item.quantity}x {item.item_name}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-2 mt-6">
                {/* PRINT BUTTON */}
                <Button 
                  onClick={() => printTicket(order)}
                  variant="outline"
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  <Printer className="w-4 h-4 mr-2" /> PRINT TICKET
                </Button>

                {order.status === 'pending' && (
                  <Button 
                    onClick={() => updateStatus(order.id, 'cooking')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-lg"
                  >
                    START COOKING
                  </Button>
                )}

                {order.status === 'cooking' && (
                  <Button 
                    onClick={() => updateStatus(order.id, 'served')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
                  >
                    ORDER READY
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}