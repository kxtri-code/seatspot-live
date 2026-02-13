"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Building2, MapPin, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PartnerOnboard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    type: 'club', // club, cafe, restaurant
    image_url: ''
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
        setLoading(true)
        if (!e.target.files || e.target.files.length === 0) return
        
        const file = e.target.files[0]
        const fileName = `venue-${Date.now()}`
        const { error } = await supabase.storage.from('images').upload(fileName, file)
        
        if (error) throw error
        
        const { data } = supabase.storage.from('images').getPublicUrl(fileName)
        setFormData({ ...formData, image_url: data.publicUrl })
    } catch (err: any) {
        alert("Upload failed: " + err.message)
    } finally {
        setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
        alert("Please log in first!")
        setLoading(false)
        return
    }

    // 1. Upgrade User Role to ADMIN
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', session.user.id)

    // 2. Create the Venue
    const { error } = await supabase.from('venues').insert([{
        owner_id: session.user.id,
        name: formData.name,
        description: formData.description,
        location: formData.location,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e',
        is_featured: false, // Pending Approval
        rating: 5.0
    }])

    if (error) {
        alert("Error: " + error.message)
    } else {
        router.push('/dashboard') // Send them to their new dashboard
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="bg-slate-900 p-8 text-white text-center">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Partner Program</h1>
            <p className="text-slate-400 mt-2">List your venue on SeatSpot</p>
        </div>

        <div className="p-8 space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Venue Name</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="e.g. SkyDeck Lounge" 
                        className="pl-10 h-12 bg-slate-50"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Location (City/Area)</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="e.g. Dimapur, 4th Mile" 
                        className="pl-10 h-12 bg-slate-50"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <Textarea 
                    placeholder="Tell us about the vibe..." 
                    className="h-24 bg-slate-50"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-700">Venue Image</label>
                 <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                    {formData.image_url ? (
                        <img src={formData.image_url} className="h-32 w-full object-cover rounded-lg" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-xs text-slate-400">Click to upload banner</span>
                        </div>
                    )}
                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
            </div>

            <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-xl"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Register Venue"}
            </Button>
        </div>

      </div>
    </div>
  )
}