"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation' // To get the Table ID from URL
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Define what a Menu Item looks like
type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
}

export default function MenuPage() {
  const params = useParams()
  const tableId = params.tableId as string // This is "1", "2", etc.
  
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<{ [key: string]: number }>({}) // Stores quantities
  const [orderStatus, setOrderStatus] = useState<string | null>(null)

  // 1. Fetch Menu on Load
  useEffect(() => {
    const fetchMenu = async () => {
      const { data } = await supabase.from('menu_items').select('*')
      if (data) setMenu(data)
    }
    fetchMenu()
  }, [])

  // 2. Add to Cart Function
  const addToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }))
  }

  // 3. Remove from Cart Function
  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCount = (prev[itemId] || 0) - 1
      if (newCount <= 0) {
        const newCart = { ...prev }
        delete newCart[itemId]
        return newCart
      }
      return { ...prev, [itemId]: newCount }
    })
  }

  // 4. Submit Order Function
  const placeOrder = async () => {
    if (Object.keys(cart).length === 0) return

    // Calculate Total
    let total = 0
    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = menu.find(m => m.id === itemId)
      if (item) total += item.price * qty
    })

    // A. Create the Order Entry
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({ table_id: tableId, status: 'pending', total_amount: total })
      .select()
      .single()

    if (orderError || !orderData) {
      alert("Error placing order")
      return
    }

    // B. Create the Order Items
    const orderItems = Object.entries(cart).map(([itemId, qty]) => {
      const item = menu.find(m => m.id === itemId)
      return {
        order_id: orderData.id,
        menu_item_id: itemId,
        quantity: qty,
        item_name: item?.name
      }
    })

    await supabase.from('order_items').insert(orderItems)

    // C. Update Table Status to 'Occupied' automatically
    await supabase.from('seats').update({ status: 'occupied' }).eq('id', tableId)

    setOrderStatus("Order Sent! The kitchen is cooking.")
    setCart({}) // Clear cart
  }

  // Helper to calculate total price of cart
  const cartTotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = menu.find(m => m.id === itemId)
    return sum + (item ? item.price * qty : 0)
  }, 0)

  if (orderStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-green-50">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Success!</h1>
        <p className="text-xl text-gray-700">{orderStatus}</p>
        <p className="mt-4 text-gray-500">Sit tight, your food is coming to Table {tableId}.</p>
        <Button onClick={() => setOrderStatus(null)} className="mt-8">Order More</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-center">Table {tableId} Menu</h1>
      </div>

      {/* Menu Grid */}
      <div className="p-4 grid gap-6">
        {menu.map((item) => (
          <Card key={item.id} className="overflow-hidden flex flex-row h-32">
            {/* Image */}
            <div className="w-32 h-32 bg-gray-200 shrink-0">
               <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-lg">${item.price}</span>
                
                {/* Add/Remove Buttons */}
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-xl font-bold text-gray-500 w-6 h-6 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-bold w-4 text-center">{cart[item.id] || 0}</span>
                  <button 
                    onClick={() => addToCart(item.id)}
                    className="text-xl font-bold text-blue-600 w-6 h-6 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Floating Checkout Bar */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">{Object.values(cart).reduce((a, b) => a + b, 0)} Items</span>
            <span className="text-xl font-bold">Total: ${cartTotal}</span>
          </div>
          <Button onClick={placeOrder} className="w-full bg-black text-white text-lg py-6">
            Place Order
          </Button>
        </div>
      )}
    </div>
  )
}