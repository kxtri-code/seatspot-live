"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Building2, MapPin, Upload, Instagram, Store, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ListVenue() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [debugMsg, setDebugMsg] = useState("") 
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    type: 'cafe',
    instagram: '',
    image_url: ''
  })

  // CHECK LOGIN STATUS ON LOAD
  useEffect(() => {
    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            setUser(session.user)
        } else {
            setDebugMsg("You are currently logged out.")
        }
    }
    checkUser()
  }, [])

  // IMAGE UPLOAD
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
        setLoading(true)
        if (!e.target.files || e.target.files.length === 0) return
        
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `venue-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file)
        if (uploadError) throw uploadError
        
        const { data } = supabase.storage.from('images').getPublicUrl(fileName)
        setFormData({ ...formData, image_url: data.publicUrl })
        setDebugMsg("Image uploaded successfully!")

    } catch (err: any) {
        setDebugMsg("Upload Error: " + err.message)
        alert("Upload failed: " + err.message)
    } finally {
        setLoading(false)
    }
  }

  // SUBMIT APPLICATION
  const handleSubmit = async () => {
    try {
        setLoading(true)
        setDebugMsg("Starting submission...")

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            alert("You must be logged in to register a venue!")
            router.push('/login')
            return
        }

        const venueData = {
            owner_id: session.user.id,
            name: formData.name,
            description: formData.description,
            location: formData.location,
            type: formData.type,
            instagram: formData.instagram,
            image_url: formData.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
            is_featured: false,
            rating: 5.0
        }

        const { error: venueError } = await supabase
            .from('venues')
            .insert([venueData])

        if (venueError) throw venueError

        // Upgrade role
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', session.user.id)

        alert("Venue Registered Successfully!")
        router.push('/dashboard')

    } catch (error: any) {
        setDebugMsg("CRITICAL ERROR: " + error.message)
        alert("Error: " + error.message)
    } finally {
        setLoading(false)
    }
  }

  // IF NOT LOGGED IN, SHOW LOGIN MESSAGE
  if (!user && !loading && debugMsg) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h1 className="text-2xl font-black text-slate-900 mb-2">Partner Login Required</h1>
                <p className="text-slate-500 mb-8">You need to log in before you can register your venue on SeatSpot.</p>
                <Link href="/login">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-xl">
                        Log In Now
                    </Button>
                </Link>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="bg-slate-900 p-8 text-white text-center">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Partner with SeatSpot</h1>
            <p className="text-slate-400 mt-2">List your venue, manage events, and grow.</p>
        </div>

        {debugMsg && (
            <div className="bg-yellow-50 p-3 text-xs font-mono text-yellow-800 border-b border-yellow-100 text-center">
                DEBUG: {debugMsg}
            </div>
        )}

        <div className="p-8 space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Venue Name</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="e.g. Kxtri Cafe" 
                        className="pl-10 h-12 bg-slate-50"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Category</label>
                    <div className="relative">
                        <Store className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <select 
                            className="w-full h-12 pl-10 bg-slate-50 border border-slate-200 rounded-md text-sm"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="club">Club / Bar</option>
                            <option value="cafe">Cafe</option>
                            <option value="restaurant">Restaurant</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <Input 
                            placeholder="Dimapur" 
                            className="pl-10 h-12 bg-slate-50"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Instagram Handle</label>
                <div className="relative">
                    <Instagram className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="@kxtri_365" 
                        className="pl-10 h-12 bg-slate-50"
                        value={formData.instagram}
                        onChange={e => setFormData({...formData, instagram: e.target.value})}
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
                 <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                    {formData.image_url ? (
                        <div className="relative">
                            <img src={formData.image_url} className="h-32 w-full object-cover rounded-lg" />
                            <p className="text-xs text-green-600 mt-2 font-bold">Image Ready</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-2">
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg rounded-xl shadow-xl shadow-blue-100"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
            </Button>
        </div>

      </div>
    </div>
  )
}