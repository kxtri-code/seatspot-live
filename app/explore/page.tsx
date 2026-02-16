"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Search, MapPin, Zap, ArrowLeft, Plus, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Explore() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams?.get('category') || 'All'
  
  const [venues, setVenues] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data: vData } = await supabase.from('venues').select('*').order('rating', { ascending: false })
      if (vData) setVenues(vData)
      
      const { data: sData } = await supabase.from('stories').select('*, venues(name, image_url)').order('created_at', { ascending: false }).limit(10)
      if (sData) setStories(sData)
      
      setLoading(false)
    }
    init()
  }, [])

  // LOGIC: Filter venues based on Home selection
  const pickedForYou = category === 'All' ? [] : venues.filter(v => v.type === category)
  const trending = venues.filter(v => v.type !== category) // Show others below

  const handleCameraClick = () => {
      if(!user) return router.push('/login')
      fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setIsPosting(true)
      
      // Simple upload logic (Story connected to User for now, or pick a venue later)
      const fileName = `story-${Date.now()}.${file.name.split('.').pop()}`
      await supabase.storage.from('stories').upload(fileName, file)
      const { data } = supabase.storage.from('stories').getPublicUrl(fileName)
      
      // For demo: Just refresh stories (In real app, you'd insert to DB)
      alert("Story Uploaded! (Demo)") 
      setIsPosting(false)
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-blue-500" /></div>

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24">
      
      {/* 1. HEADER */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md p-6 border-b border-slate-800">
          <div className="flex justify-between items-center mb-4">
              <div>
                  <button onClick={() => router.push('/')} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white mb-1 transition-colors">
                      <ArrowLeft className="w-3 h-3" /> Change Vibe
                  </button>
                  <h1 className="text-3xl font-black tracking-tighter">Explore</h1>
              </div>
              <div onClick={() => router.push(user ? '/profile' : '/login')}>
                  <Avatar className="w-10 h-10 border border-slate-700 cursor-pointer">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-slate-800 text-white"><User className="w-5 h-5"/></AvatarFallback>
                  </Avatar>
              </div>
          </div>
          <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <Input placeholder={`Search ${category === 'All' ? 'venues' : category + 's'}...`} className="h-12 pl-12 bg-slate-900 border-slate-800 rounded-2xl text-white focus:border-blue-600" />
          </div>
      </div>

      {/* 2. STORIES (Camera Fixed) */}
      <div className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Live Now</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              <div onClick={handleCameraClick} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-900 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-all">
                      {isPosting ? <Loader2 className="animate-spin w-6 h-6"/> : <Plus className="w-6 h-6" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">Add Story</span>
                  {/* HIDDEN INPUT: capture="environment" forces camera on mobile */}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
              </div>
              {stories.map((story) => (
                  <div key={story.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                      <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-purple-600 group-hover:scale-105 transition-transform">
                          <div className="w-full h-full rounded-full border-2 border-slate-950 overflow-hidden">
                              <img src={story.venues?.image_url || story.media_url} className="w-full h-full object-cover" />
                          </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 w-16 truncate text-center">{story.venues?.name || 'User'}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* 3. "PICKED FOR YOU" (Category Results) */}
      {pickedForYou.length > 0 && (
          <div className="px-6 pb-6">
              <h2 className="text-xl font-black mb-4">Top {category}s For You</h2>
              <div className="space-y-6">
                  {pickedForYou.map((v) => <VenueCard key={v.id} venue={v} router={router} />)}
              </div>
          </div>
      )}

      {/* 4. "TRENDING TONIGHT" (Everything Else) */}
      <div className="px-6 pb-6">
          <h2 className="text-xl font-black mb-4">Trending Tonight</h2>
          <div className="space-y-6">
              {trending.map((v) => <VenueCard key={v.id} venue={v} router={router} />)}
          </div>
      </div>
    </div>
  )
}

// Sub-component for consistency
function VenueCard({ venue, router }: { venue: any, router: any }) {
    return (
        <div onClick={() => router.push(`/venues/${venue.id}`)} className="group relative h-64 rounded-[2rem] overflow-hidden cursor-pointer border border-slate-800 shadow-2xl active:scale-95 transition-transform">
            <img src={venue.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-xs font-bold text-white">★ {venue.rating}</span>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-2xl font-black text-white leading-none mb-2">{venue.name}</h3>
                        <p className="flex items-center gap-1.5 text-slate-300 text-sm font-bold"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {venue.location}</p>
                    </div>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider">View</div>
                </div>
            </div>
        </div>
    )
}