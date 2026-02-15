"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Loader2, Save, Layout, ShieldAlert, CheckCircle, Image as ImageIcon, 
  Type, Link as LinkIcon, Zap, Upload, X, Users, Wallet, TrendingUp, 
  Search, MoreHorizontal, Menu, Home, Building2, FileText, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// --- TYPES ---
type ViewState = 'dashboard' | 'users' | 'venues' | 'cms';

export default function SuperAdmin() {
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewState>('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Data State
  const [assets, setAssets] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Action State
  const [savingId, setSavingId] = useState<string | null>(null)
  const [storyData, setStoryData] = useState({ venueId: '', url: '' })
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [isPostingStory, setIsPostingStory] = useState(false)
  const [topUpAmounts, setTopUpAmounts] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- INIT ---
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
      const { data: assetData } = await supabase.from('cms_assets').select('*').order('id')
      if (assetData) setAssets(assetData)

      const { data: venueData } = await supabase.from('venues').select('*').order('created_at')
      if (venueData) {
          setVenues(venueData)
          if(venueData.length > 0) setStoryData(prev => ({ ...prev, venueId: venueData[0].id }))
      }

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
      const { error } = await supabase.rpc('admin_topup_wallet', { target_user_id: userId, amount: Number(amount) })
      if (error) alert("Failed: " + error.message)
      else {
          alert(`Success! Added ₹${amount}`)
          setTopUpAmounts(prev => ({...prev, [userId]: ''}))
          fetchData()
      }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin mr-2"/> verifying_god_access...</div>

  // --- COMPONENTS ---

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
      <button 
        onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${currentView === view ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
      >
          <Icon className="w-5 h-5" />
          {label}
      </button>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col md:flex-row">
      
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-950 border-r border-slate-900 h-screen sticky top-0">
          <div className="p-8 pb-4">
              <h1 className="text-2xl font-black flex items-center gap-2 tracking-tighter text-white">
                  <ShieldAlert className="text-red-500 w-6 h-6" /> GOD MODE
              </h1>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-2 pl-1">Command Center</p>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
              <NavItem view="dashboard" icon={Home} label="Overview" />
              <NavItem view="users" icon={Users} label="User Economy" />
              <NavItem view="venues" icon={Building2} label="Venue Manager" />
              <NavItem view="cms" icon={FileText} label="Content Editor" />
          </nav>
          <div className="p-4 border-t border-slate-900">
             <div className="bg-slate-900 rounded-xl p-4">
                 <div className="flex items-center gap-2 mb-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                     <span className="text-xs font-bold text-green-500 uppercase">System Online</span>
                 </div>
                 <p className="text-[10px] text-slate-500 font-mono">v2.4.0 (Stable)</p>
             </div>
          </div>
      </aside>

      {/* 2. MOBILE HEADER */}
      <div className="md:hidden bg-slate-950 border-b border-slate-900 p-4 sticky top-0 z-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <ShieldAlert className="text-red-500 w-6 h-6" />
             <span className="font-black text-lg">GOD MODE</span>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </Button>
      </div>

      {/* 3. MOBILE MENU (Overlay) */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl md:hidden pt-24 px-6 space-y-4">
              <NavItem view="dashboard" icon={Home} label="Overview" />
              <NavItem view="users" icon={Users} label="User Economy" />
              <NavItem view="venues" icon={Building2} label="Venue Manager" />
              <NavItem view="cms" icon={FileText} label="Content Editor" />
          </div>
      )}

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-black/50">
          <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* VIEW: DASHBOARD OVERVIEW */}
              {currentView === 'dashboard' && (
                  <>
                    <h2 className="text-3xl font-black text-white mb-6">System Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <Users className="w-8 h-8 text-blue-500 mb-4" />
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Users</h3>
                            <p className="text-3xl font-black text-white mt-1">{users.length}</p>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <Wallet className="w-8 h-8 text-green-500 mb-4" />
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Money</h3>
                            <p className="text-3xl font-black text-green-400 mt-1">₹{(users.reduce((acc, u) => acc + (u.wallets?.[0]?.balance || 0), 0) / 1000).toFixed(1)}k</p>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <Building2 className="w-8 h-8 text-purple-500 mb-4" />
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Venues</h3>
                            <p className="text-3xl font-black text-white mt-1">{venues.length}</p>
                        </div>
                         <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">System Health</h3>
                            <p className="text-3xl font-black text-white mt-1">100%</p>
                        </div>
                    </div>
                  </>
              )}

              {/* VIEW: USERS & ECONOMY */}
              {currentView === 'users' && (
                  <div className="space-y-6">
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-3xl font-black text-white">Central Bank</h2>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <Input 
                                placeholder="Search users..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-900 border-slate-800 text-white h-12 rounded-xl focus:ring-blue-500 focus:border-blue-500" 
                            />
                        </div>
                     </div>

                     <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-800">
                                    <tr>
                                        <th className="p-4 pl-6">User</th>
                                        <th className="p-4">Balance</th>
                                        <th className="p-4 text-right pr-6">Inject Funds</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                                                        {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover"/> : <Users className="w-full h-full p-2 text-slate-500"/>}
                                                    </div>
                                                    <div className="max-w-[150px] md:max-w-none">
                                                        <p className="font-bold text-white text-sm truncate">{user.full_name || 'Anonymous'}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono truncate">{user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-lg border border-green-500/20">
                                                    <Wallet className="w-3 h-3" />
                                                    <span className="font-mono font-bold">₹{user.wallets?.[0]?.balance?.toLocaleString() || 0}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Input 
                                                        placeholder="Amount" 
                                                        type="number"
                                                        value={topUpAmounts[user.id] || ''}
                                                        onChange={(e) => setTopUpAmounts({...topUpAmounts, [user.id]: e.target.value})}
                                                        className="w-24 md:w-32 bg-black border-slate-700 h-10 text-white text-xs"
                                                    />
                                                    <Button 
                                                        onClick={() => handleTopUp(user.id)}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-500 text-white font-bold h-10 px-4"
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                  </div>
              )}

              {/* VIEW: VENUES */}
              {currentView === 'venues' && (
                  <div className="space-y-6">
                      <h2 className="text-3xl font-black text-white">Venue Manager</h2>
                      
                      {/* UPLOADER */}
                      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 md:p-8 rounded-3xl border border-blue-500/30 relative overflow-hidden">
                         <div className="relative z-10 space-y-4">
                            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                                <Zap className="w-5 h-5 text-yellow-400" /> Post Live Story
                            </h3>
                            <div className="flex flex-col md:flex-row gap-4">
                                 <select 
                                    value={storyData.venueId} 
                                    onChange={(e) => setStoryData({...storyData, venueId: e.target.value})} 
                                    className="w-full md:w-1/3 h-12 bg-slate-950 border border-slate-700 rounded-xl text-white px-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                                 >
                                     {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                 </select>
                                 <div className="flex-1 w-full" onClick={() => fileInputRef.current?.click()}>
                                     <div className={`h-12 w-full rounded-xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${storyFile ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-slate-950 border-slate-700 hover:border-blue-500 text-slate-400'}`}>
                                         {storyFile ? <span className="text-xs font-bold truncate px-2">{storyFile.name}</span> : <span className="text-xs font-bold flex items-center gap-2"><Upload className="w-4 h-4"/> Upload Media</span>}
                                     </div>
                                     <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if(e.target.files?.[0]) setStoryFile(e.target.files[0]) }} />
                                 </div>
                                 <Button onClick={handlePostStory} disabled={isPostingStory} className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-8 w-full md:w-auto">
                                     {isPostingStory ? <Loader2 className="animate-spin"/> : "Post"}
                                 </Button>
                            </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {venues.map(v => (
                            <div key={v.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <img src={v.image_url} className="w-14 h-14 rounded-xl object-cover bg-slate-800"/>
                                    <div>
                                        <h4 className="font-bold text-white">{v.name}</h4>
                                        <p className="text-xs text-slate-500">{v.location}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-slate-500"><MoreHorizontal/></Button>
                            </div>
                        ))}
                     </div>
                  </div>
              )}

              {/* VIEW: CMS */}
              {currentView === 'cms' && (
                  <div className="space-y-6">
                      <h2 className="text-3xl font-black text-white">Content Editor</h2>
                      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                          {assets.map((asset) => (
                              <div key={asset.id} className="group">
                                  <div className="flex justify-between items-center mb-2">
                                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                          {asset.type === 'image' ? <ImageIcon className="w-3 h-3"/> : <Type className="w-3 h-3"/>} {asset.label}
                                      </label>
                                      {asset.type === 'image' && <a href={asset.content} target="_blank" className="text-[10px] text-blue-400 hover:underline">View</a>}
                                  </div>
                                  <div className="flex gap-4">
                                      <div className="flex-1 relative">
                                          <Input 
                                            value={asset.content} 
                                            onChange={(e) => setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, content: e.target.value } : a))} 
                                            className="font-mono text-xs bg-black border-slate-800 text-slate-200 h-12 focus:border-blue-500" 
                                          />
                                          {asset.type === 'image' && <img src={asset.content} className="absolute right-2 top-2 w-8 h-8 rounded border border-slate-700 object-cover bg-slate-800"/>}
                                      </div>
                                      <Button 
                                        onClick={() => handleAssetSave(asset.id, asset.content)} 
                                        disabled={savingId === asset.id} 
                                        className={`h-12 w-12 rounded-xl shrink-0 ${savingId === asset.id ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                                      >
                                          {savingId === asset.id ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5"/>}
                                      </Button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

          </div>
      </main>
    </div>
  )
}