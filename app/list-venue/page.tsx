"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
// REMOVED: import { Card, CardContent } from '@/components/ui/card'
import { Store, CheckCircle, MapPin } from 'lucide-react'

export default function ListVenue() {
  const [formData, setFormData] = useState({
    name: '', location: '', category: 'Cafe', description: '', instagram: '', contact_email: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    const { error } = await supabase.from('venues').insert([{
        ...formData,
        is_featured: false, 
        rating: 0,
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4' 
    }])

    if (!error) setSubmitted(true)
  }

  if (submitted) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-black mb-2">Application Sent!</h1>
      <p className="text-slate-500 max-w-md">Your venue <strong>{formData.name}</strong> has been submitted. We will review and activate your listing within 24 hours.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 p-6 pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-2">Partner with SeatSpot</h1>
            <p className="text-slate-500">List your venue, manage events, and get discovered by thousands in Dimapur.</p>
        </div>

        {/* REPLACED CARD WITH STANDARD DIV */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 space-y-6">
                <div className="space-y-2">
                    <label className="font-bold text-sm">Venue Name</label>
                    <div className="relative">
                        <Store className="absolute left-3 top-3 w-5 h-5 text-slate-400"/>
                        <Input className="pl-10" placeholder="e.g. Urban Terrace" onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="font-bold text-sm">Category</label>
                        <select 
                            className="w-full h-10 rounded-md border border-slate-200 px-3 bg-white text-sm"
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option>Cafe</option>
                            <option>Rooftop</option>
                            <option>Club</option>
                            <option>Dining</option>
                            <option>Resort</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="font-bold text-sm">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400"/>
                            <Input className="pl-10" placeholder="e.g. Half Nagarjan" onChange={e => setFormData({...formData, location: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-sm">Instagram Handle</label>
                    <Input placeholder="@yourvenue" onChange={e => setFormData({...formData, instagram: e.target.value})} />
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-sm">Description</label>
                    <Textarea placeholder="Tell us about your vibe..." onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold text-lg">
                    Submit Application
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}