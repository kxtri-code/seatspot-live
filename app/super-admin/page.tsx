"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Save, Layout, ShieldAlert, CheckCircle, Image as ImageIcon, Type, Link as LinkIcon, Zap, Upload, X, Users, Wallet, TrendingUp, Search, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SuperAdmin() {
  const [loading, setLoading] = useState(true)
  
  // Data State
  const [assets, setAssets] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // UI State
  const [savingId, setSavingId] = useState<string | null>(null)
  const [storyData, setStoryData] = useState({ venueId: '', url: '' })
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [isPostingStory, setIsPostingStory] = useState(false)
  const [topUpAmounts, setTopUpAmounts] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  // INIT
  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
        setFilteredUsers(users)
    } else {
        const lower = searchQuery.toLowerCase()
        setFilteredUsers(users.filter(u => 
            u.full_name?.toLowerCase().includes(lower) || 
            u.id.toLowerCase().includes(lower)
        ))
    }
  }, [searchQuery, users])

  const fetchData = async () => {
      setLoading(true)
      
      // 1. Assets
      const { data: assetData } = await supabase.from('cms_assets').select('*').order('id')
      if (assetData) setAssets(assetData)

      // 2. Venues
      const { data: venueData } = await supabase.from('venues').select('*').order('created_at')
      if (venueData) {
          setVenues(venueData)
          if(venueData.length > 0) setStoryData(prev => ({ ...prev, venueId: venueData[0].id }))
      }

      // 3. Users & Wallets
      const { data: userData } = await supabase
        .from('profiles')
        .select(`*, wallets ( balance )`)
        .order('created_at', { ascending: false })
      
      if (userData) {
          setUsers(userData)
          setFilteredUsers(userData)
      }
      
      setLoading(false)
  }

  // --- HANDLERS ---
  const handleAssetSave = async (id: string, content: string) => {
    setSavingId(id)
    await supabase.from('cms_assets').update({ content }).eq('id', id)
    setTimeout(() => setSavingId(null), 1000)
  }

  const handlePostStory = async () => {
      if (!storyData.venueId) return alert("Select venue")
      setIsPostingStory(true)
      let finalUrl = storyData.url
      try {
          if (storyFile) {
              const path = `${storyData.venueId}/${Date.now()}.${storyFile.name.split('.').pop()}`
              await supabase.storage.from('stories').upload(path, storyFile)
              const { data } = supabase.storage.from('stories').getPublicUrl(path)
              finalUrl = data.publicUrl
          }
          await supabase.from('stories').insert({ venue_id: storyData.venueId, media_url: finalUrl })
          alert("Posted!")
          setStoryData(prev => ({...prev, url: ''})); setStoryFile(null);
      } catch (e: any) { alert(e.message) }
      setIsPostingStory(false)
  }

  const handleTopUp = async (userId: string) => {
      const amount = topUpAmounts[userId]
      if (!amount || isNaN(Number(amount))) return alert("Enter valid amount")

      const { error } = await supabase.rpc('admin_topup_wallet', {
          target_user_id: userId,
          amount: Number(amount)
      })

      if (error) {
          alert("Failed: " + error.message)
      } else {
          alert(`Successfully added ₹${amount} to user!`)
          setTopUpAmounts(prev => ({...prev, [userId]: ''}))
          fetchData()
      }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin mr-2"/> Verifying God Access...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 sticky top-0 z-50 flex justify-between items-center shadow-2xl backdrop-blur-md bg-opacity-90">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                  <ShieldAlert className="text-red-500 w-6 h-6" />
              </div>
              <div>
                  <h1 className="text-xl font-black text-white tracking-tight">GOD MODE</h1>
                  <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Platform Command Center</p>
              </div>
          </div>
          <div className="flex gap-4">
              <div className="hidden md:block text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">System Status</p>
                  <div className="flex items-center gap-2 justify-end">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                      <span className="text-green-500 font-bold text-sm">Online</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
          
          <Tabs defaultValue="economy" className="w-full">
            <TabsList className="w-full bg-slate-900 p-1 rounded-xl border border-slate-800 mb-8 grid grid-cols-3">
                <TabsTrigger value="economy" className="font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-white">User & Economy</TabsTrigger>
                <TabsTrigger value="venues" className="font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-white">Venue Manager</TabsTrigger>
                <TabsTrigger value="cms" className="font-bold data-[state=active]:bg-slate-800 data-[state=active]:text-white">CMS Editor</TabsTrigger>
            </TabsList>

            {/* TAB 1: ECONOMY */}
            <TabsContent value="economy" className="space-y-6 animate-in fade-in">
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Users className="w-20 h-20 text-blue-500" /></div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Users</h3>
                        <p className="text-4xl font-black text-white">{users.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-900 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Wallet className="w-20 h-20 text-green-500" /></div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Economy</h3>
                        <p className="text-4xl font-black text-green-400">
                             ₹{users.reduce((acc, u) => acc + (u.wallets?.[0]?.balance || 0), 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" /> Central Bank
                        </h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <Input 
                                placeholder="Search users..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-black border-slate-700 text-white h-10 rounded-xl focus:ring-blue-500" 
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="p-4 pl-6">User Identity</th>
                                    <th className="p-4">Wallet Balance</th>
                                    <th className="p-4 text-right pr-6">Inject Funds</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700 shadow-sm">
                                                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : <Users className="w-full h-full p-2 text-slate-500"/>}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{user.full_name || 'Anonymous'}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-lg border border-green-500/20">
                                                <Wallet className="w-3 h-3" />
                                                <span className="font-mono font-bold text-lg">₹{user.wallets?.[0]?.balance?.toLocaleString() || 0}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-bold">₹</span>
                                                    <Input 
                                                        placeholder="Amount" 
                                                        type="number"
                                                        value={topUpAmounts[user.id] || ''}
                                                        onChange={(e) => setTopUpAmounts({...topUpAmounts, [user.id]: e.target.value})}
                                                        className="w-32 pl-6 bg-black border-slate-700 h-10 text-white focus:border-green-500 transition-colors"
                                                    />
                                                </div>
                                                <Button 
                                                    onClick={() => handleTopUp(user.id)}
                                                    className="bg-green-600 hover:bg-green-500 text-white font-bold h-10 shadow-lg shadow-green-900/20"
                                                >
                                                    <TrendingUp className="w-4 h-4 mr-2" /> Add
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </TabsContent>

            {/* TAB 2: VENUES */}
            <TabsContent value="venues" className="space-y-6">
                 {/* UPLOADER */}
                 <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-8 rounded-[2rem] border border-blue-500/30 relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 p-4 opacity-20"><Zap className="w-32 h-32 text-blue-400" /></div>
                     <div className="relative z-10">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-3 text-xl relative z-10">Post Live Story</h3>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                             <div className="w-full md:w-1/3">
                                 <label className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2 block">Select Venue</label>
                                 <select value={storyData.venueId} onChange={(e) => setStoryData({...storyData, venueId: e.target.value})} className="w-full h-14 bg-slate-950 border border-slate-700 rounded-xl text-white px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none">
                                     {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                 </select>
                             </div>
                             <div className="flex-1 w-full">
                                 <label className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2 block">Upload Media</label>
                                 <div className="flex gap-2">
                                     <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if(e.target.files?.[0]) setStoryFile(e.target.files[0]) }} />
                                     <div onClick={() => fileInputRef.current?.click()} className={`flex-1 h-14 rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${storyFile ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-slate-950 border-slate-700 hover:border-blue-500 text-slate-400'}`}>
                                         {storyFile ? <><CheckCircle className="w-5 h-5" /> <span className="text-sm font-bold">{storyFile.name}</span></> : <><Upload className="w-5 h-5" /> <span className="text-sm font-bold">Choose File</span></>}
                                     </div>
                                 </div>
                             </div>
                             <Button onClick={handlePostStory} disabled={isPostingStory} className="h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-900/20">{isPostingStory ? <Loader2 className="animate-spin"/> : "Post Live"}</Button>
                        </div>
                     </div>
                 </div>
                 
                 {/* LIST */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venues.map(v => (
                        <div key={v.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center group hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4"><img src={v.image_url} className="w-16 h-16 rounded-xl object-cover shadow-sm"/><h4 className="font-bold text-white text-lg">{v.name}</h4></div>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white"><MoreHorizontal/></Button>
                        </div>
                    ))}
                 </div>
            </TabsContent>

            {/* TAB 3: CMS */}
            <TabsContent value="cms" className="space-y-6">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="grid gap-6">
                        {assets.map((asset) => (
                            <div key={asset.id} className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-6 items-start hover:border-slate-700 transition-colors">
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">{asset.type === 'image' ? <ImageIcon className="w-3 h-3"/> : <Type className="w-3 h-3"/>} {asset.label}</label>
                                        {asset.type === 'image' && <a href={asset.content} target="_blank" className="text-[10px] text-blue-400 hover:underline">View Source</a>}
                                    </div>
                                    <div className="relative">
                                        <Input value={asset.content} onChange={(e) => setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, content: e.target.value } : a))} className="font-mono text-xs bg-black border-slate-800 text-slate-200 h-12 focus:border-blue-500" />
                                        {asset.type === 'image' && <img src={asset.content} className="absolute right-2 top-2 w-8 h-8 rounded object-cover border border-slate-700"/>}
                                    </div>
                                </div>
                                <Button onClick={() => handleAssetSave(asset.id, asset.content)} disabled={savingId === asset.id} className={`h-12 w-full md:w-auto px-6 mt-auto rounded-xl font-bold ${savingId === asset.id ? 'bg-green-600' : 'bg-white text-black hover:bg-slate-200'}`}>{savingId === asset.id ? <CheckCircle className="w-5 h-5" /> : "Save"}</Button>
                            </div>
                        ))}
                    </div>
                </div>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  )
}