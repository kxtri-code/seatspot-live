"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [status, setStatus] = useState('Ready to Initialize')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const runSetup = async () => {
    setLoading(true)
    setStatus('Starting...')

    try {
      // 1. CLEAR OLD DATA (Best effort)
      await supabase.from('seats').delete().neq('id', '00000000-0000-0000-0000-000000000000') 
      await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000') 
      await supabase.from('venues').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      // 2. INSERT VENUES
      const { error: venueError } = await supabase.from('venues').insert([
        { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', name: 'SkyDeck Lounge', location: '4th Mile, Dimapur', type: 'club', description: 'Premier rooftop destination with weekend DJ sets.', image_url: 'https://images.unsplash.com/photo-1570554886111-e811ac311232', rating: 4.8 },
        { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', name: 'The Box', location: 'Supermarket Area', type: 'club', description: 'Industrial chic vibes with the best sound system.', image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67', rating: 4.6 },
        { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', name: 'Playground', location: 'Circular Road', type: 'club', description: 'High energy, neon lights, and loud bass.', image_url: 'https://images.unsplash.com/photo-1578736641330-3155e606cd40', rating: 4.5 },
        { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', name: 'The Beanery', location: 'Near Clock Tower', type: 'cafe', description: 'Cozy retreat famous for cold brew.', image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', rating: 4.9 },
        { id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', name: 'Nagaland Coffee', location: 'Duncan Basti', type: 'cafe', description: 'Authentic, locally sourced coffee.', image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf', rating: 4.8 },
        { id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', name: 'Ethnic Table', location: 'Notun Basti', type: 'restaurant', description: 'Traditional Naga cuisine elevated.', image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de', rating: 4.9 },
        { id: '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', name: 'Bambusa', location: 'City Center', type: 'restaurant', description: 'The classic family choice.', image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', rating: 4.6 }
      ])
      if (venueError) throw venueError

      // 3. INSERT EVENTS
      const { error: eventError } = await supabase.from('events').insert([
        { title: 'Techno Bunker', date: new Date(Date.now() + 86400000).toISOString(), venue_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', venue_name: 'The Box', price_per_seat: 800, image_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1' },
        { title: 'Live Jazz', date: new Date(Date.now() + 172800000).toISOString(), venue_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', venue_name: 'SkyDeck Lounge', price_per_seat: 500, image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629' }
      ])
      if (eventError) throw eventError

      setStatus('Success! Database Populated.')
      setTimeout(() => router.push('/explore'), 1500)

    } catch (err: any) {
      console.error(err)
      setStatus('FAILED: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center space-y-6">
        <h1 className="text-2xl font-bold">Database Repair</h1>
        <p className="text-slate-400 text-sm">This will forcibly inject the demo data into your database using your active connection.</p>
        
        <div className={`p-4 rounded-lg font-mono text-sm ${status.includes('FAILED') ? 'bg-red-900/50 text-red-200' : 'bg-slate-950 text-slate-300'}`}>
            {status}
        </div>

        <Button 
            onClick={runSetup} 
            disabled={loading}
            className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-500"
        >
            {loading ? <Loader2 className="animate-spin mr-2"/> : 'Initialize Database'}
        </Button>
      </div>
    </div>
  )
}