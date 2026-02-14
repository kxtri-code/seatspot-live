"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Save, Layout, ShieldAlert, CheckCircle, Image as ImageIcon, Type, Link as LinkIcon, Radio, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SuperAdmin() {
  const [assets, setAssets] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  
  // State for new story upload
  const [storyData, setStoryData] = useState({ venueId: '', url: '' })
  const [isPostingStory, setIsPostingStory] = useState(false)

  // INIT
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // 1. Fetch CMS Assets
      const { data: assetData } = await supabase.from('cms_assets').select('*').order('id')
      if (assetData) setAssets(assetData)

      // 2. Fetch Venues (For management & story posting)
      const { data: venueData } = await supabase.from('venues').select('*').order('created_at')
      if (venueData) {
          setVenues(venueData)
          // Set default selected venue for story
          if(venueData.length > 0) setStoryData(prev => ({ ...prev, venueId: venueData[0].id }))
      }
      
      setLoading(false)
    }
    fetchData()
  }, [])

  // CMS HANDLERS
  const handleAssetChange = (id: string, newVal: string) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, content: newVal } : a))
  }

  const handleAssetSave = async (id: string, content: string) => {
    setSavingId(id)
    const { error } = await supabase
      .from('cms_assets')
      .update({ content })
      .eq('id', id)
    
    if (error) {
        alert("Error: " + error.message)
    } else {
        setTimeout(() => setSavingId(null), 1000)
    }
  }

  // STORY HANDLER
  const handlePostStory = async () => {
      if (!storyData.url || !storyData.venueId) return alert("Please select a venue and enter an image URL")
      
      setIsPostingStory(true)
      const { error } = await supabase.from('stories').insert({
          venue_id: storyData.venueId,
          media_url: storyData.url
      })

      if (error) {
          alert(error.message)
      } else {
          alert("Live Story Posted Successfully!")
          setStoryData(prev => ({ ...prev, url: '' })) // Clear input
      }
      setIsPostingStory(false)
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin mr-2"/> Verifying God Access...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
      
      {/* GOD MODE HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 sticky top-0 z-50 flex justify-between items-center shadow-2xl">
          <div>
              <h1 className="text-2xl font-black flex items-center gap-2 text-white">
                  <ShieldAlert className="text-red-500 fill-red-500/20" /> GOD MODE
              </h1>
              <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Full Platform Control • {venues.length} Venues Active</p>
          </div>
          <Button variant="destructive" size="sm" className="font-bold uppercase tracking-widest">
              Admin Access
          </Button>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
          
          <Tabs defaultValue="venues" className="w-full">
            <TabsList className="w-full bg-slate-900 p-1 rounded-xl border border-slate-800 mb-8">
                <TabsTrigger value="cms" className="flex-1 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">Homepage Editor</TabsTrigger>
                <TabsTrigger value="venues" className="flex-1 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">Venue Manager & Stories</TabsTrigger>
                <TabsTrigger value="users" className="flex-1 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">User Roles</TabsTrigger>
            </TabsList>

            {/* TAB 1: HOMEPAGE CMS EDITOR */}
            <TabsContent value="cms" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-white text-xl flex items-center gap-2">
                            <Layout className="w-6 h-6 text-blue-500" /> Live Site Visuals
                        </h3>
                        <span className="text-xs font-mono text-slate-500">Updates reflect instantly</span>
                    </div>
                    
                    <div className="grid gap-6">
                        {assets.map((asset) => (
                            <div key={asset.id} className="group bg-slate-950/50 p-4 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        {asset.type === 'image' ? <ImageIcon className="w-3 h-3"/> : <Type className="w-3 h-3"/>}
                                        {asset.label}
                                    </label>
                                    {asset.type === 'image' && (
                                        <a href={asset.content} target="_blank" className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 flex items-center gap-1">
                                            <LinkIcon className="w-3 h-3"/> View
                                        </a>
                                    )}
                                </div>
                                
                                <div className="flex gap-4 items-start">
                                    <div className="flex-1 relative">
                                        <Input 
                                            value={asset.content} 
                                            onChange={(e) => handleAssetChange(asset.id, e.target.value)}
                                            className="font-mono text-xs bg-black border-slate-800 text-slate-200 h-12 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {/* Image Preview */}
                                        {asset.type === 'image' && (
                                            <div className="absolute right-2 top-2 w-8 h-8 rounded border border-slate-700 overflow-hidden bg-slate-800 group-hover:scale-150 transition-transform origin-top-right z-10">
                                                <img src={asset.content} className="w-full h-full object-cover" alt="preview" />
                                            </div>
                                        )}
                                    </div>
                                    <Button 
                                        onClick={() => handleAssetSave(asset.id, asset.content)}
                                        disabled={savingId === asset.id}
                                        className={`w-14 h-12 rounded-xl font-bold transition-all ${savingId === asset.id ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-slate-200'}`}
                                    >
                                        {savingId === asset.id ? <CheckCircle className="w-5 h-5" /> : "Save"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </TabsContent>

            {/* TAB 2: VENUE MANAGER & STORIES */}
            <TabsContent value="venues" className="space-y-6">
                 
                 {/* NEW: QUICK STORY UPLOADER */}
                 <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-8 rounded-[2rem] border border-blue-500/30 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-20"><Zap className="w-32 h-32 text-blue-400" /></div>
                     
                     <h3 className="font-bold text-white mb-6 flex items-center gap-3 text-xl relative z-10">
                         <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                         </span>
                         Post Live Story
                     </h3>
                     
                     <div className="flex gap-4 items-end relative z-10">
                         <div className="w-1/3">
                             <label className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2 block">Select Venue</label>
                             <select 
                                value={storyData.venueId}
                                onChange={(e) => setStoryData({...storyData, venueId: e.target.value})}
                                className="w-full h-14 bg-slate-950 border border-slate-700 rounded-xl text-white px-4 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                             >
                                 {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                             </select>
                         </div>
                         <div className="flex-1">
                             <label className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2 block">Image URL</label>
                             <Input 
                                value={storyData.url}
                                onChange={(e) => setStoryData({...storyData, url: e.target.value})}
                                placeholder="https://images.unsplash.com/..." 
                                className="bg-slate-950 border-slate-700 text-white h-14 rounded-xl" 
                             />
                         </div>
                         <Button 
                            onClick={handlePostStory}
                            disabled={isPostingStory}
                            className="h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-900/20"
                         >
                             {isPostingStory ? <Loader2 className="animate-spin"/> : "Post Live"}
                         </Button>
                     </div>
                 </div>

                 {/* VENUE LIST */}
                 <div className="space-y-4">
                    <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest pl-2">Managed Venues</h3>
                    {venues.map(v => (
                        <div key={v.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center group hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden relative">
                                    <img src={v.image_url} className="w-full h-full object-cover"/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{v.name}</h4>
                                    <p className="text-xs text-slate-400">{v.location}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent">Edit Details</Button>
                        </div>
                    ))}
                 </div>
            </TabsContent>

            {/* TAB 3: USER ROLES (Coming Soon) */}
            <TabsContent value="users">
                <div className="p-10 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                    <p className="text-slate-500">User Role Management Module Loading...</p>
                </div>
            </TabsContent>
          </Tabs>

      </div>
    </div>
  )
}