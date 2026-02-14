"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Save, Layout, ShieldAlert, CheckCircle, Image as ImageIcon, Type, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SuperAdmin() {
  const [assets, setAssets] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  // INIT
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // 1. Fetch CMS Assets
      const { data: assetData } = await supabase.from('cms_assets').select('*').order('id')
      if (assetData) setAssets(assetData)

      // 2. Fetch Venues (For management)
      const { data: venueData } = await supabase.from('venues').select('*').order('created_at')
      if (venueData) setVenues(venueData)
      
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
          
          <Tabs defaultValue="cms" className="w-full">
            <TabsList className="w-full bg-slate-900 p-1 rounded-xl border border-slate-800 mb-8">
                <TabsTrigger value="cms" className="flex-1 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">Homepage Editor</TabsTrigger>
                <TabsTrigger value="venues" className="flex-1 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">Venue Manager</TabsTrigger>
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

            {/* TAB 2: VENUE MANAGER */}
            <TabsContent value="venues" className="space-y-4">
                 {venues.map(v => (
                     <div key={v.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden">
                                 <img src={v.image_url} className="w-full h-full object-cover"/>
                             </div>
                             <div>
                                 <h4 className="font-bold text-white">{v.name}</h4>
                                 <p className="text-xs text-slate-400">{v.location}</p>
                             </div>
                         </div>
                         <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">Edit Details</Button>
                     </div>
                 ))}
            </TabsContent>

            {/* TAB 3: USER ROLES (Coming Soon) */}
            <TabsContent value="users">
                <div className="p-10 text-center border border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-500">User Role Management Module Loading...</p>
                </div>
            </TabsContent>
          </Tabs>

      </div>
    </div>
  )
}