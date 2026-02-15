"use client"

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Loader2, Save, ShieldAlert, CheckCircle, Image as ImageIcon, 
  Type, Zap, Upload, X, Users, Wallet, 
  Search, MoreHorizontal, Menu, Home, Building2, FileText, Plus, MapPin, Settings, DollarSign, Calendar, Edit2, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// --- TYPES ---
type ViewState = 'dashboard' | 'users' | 'venues' | 'cms' | 'settings';

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
  const [systemConfig, setSystemConfig] = useState({ signup_bonus: 5000 })
  
  // Action State
  const [savingId, setSavingId] = useState<string | null>(null)
  const [storyData, setStoryData] = useState({ venueId: '', url: '' })
  const [storyFile, setStoryFile] = useState<File | null>(null)
  const [isPostingStory, setIsPostingStory] = useState(false)
  const [topUpAmounts, setTopUpAmounts] = useState<Record<string, string>>({})

  // Venue State
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false)
  const [isEditVenueOpen, setIsEditVenueOpen] = useState(false) // NEW: Edit Modal
  const [venueForm, setVenueForm] = useState({ id: '', name: '', location: '', type: 'Club', description: '', google_maps_url: '', image_url: '' })
  const [venueImage, setVenueImage] = useState<File | null>(null)
  const [isSubmittingVenue, setIsSubmittingVenue] = useState(false)

  // Event State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ venue_id: '', title: '', date: '', price: '', ticket_type: 'paid', external_url: '' })
  const [eventImage, setEventImage] = useState<File | null>(null)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const venueImageRef = useRef<HTMLInputElement>(null)
  const eventImageRef = useRef<HTMLInputElement>(null)

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
            (u.full_name || '').toLowerCase().includes(lower) || 
            u.id.toLowerCase().includes(lower)
        ))
    }
  }, [searchQuery, users])

  const fetchData = async () => {
      setLoading(true)
      try {
        const { data: assetData } = await supabase.from('cms_assets').select('*').order('id')
        if (assetData) setAssets(assetData)

        const { data: venueData } = await supabase.from('venues').select('*').order('created_at', { ascending: false })
        if (venueData) {
            setVenues(venueData)
            if(venueData.length > 0) {
                setStoryData(prev => ({ ...prev, venueId: venueData[0].id }))
                setNewEvent(prev => ({ ...prev, venue_id: venueData[0].id }))
            }
        }

        const { data: configData } = await supabase.from('system_config').select('*').eq('id', 1).single()
        if (configData) setSystemConfig(configData)

        const { data: profileData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        const { data: walletData } = await supabase.from('wallets').select('*');
        
        if (profileData && walletData) {
            const combinedUsers = profileData.map(profile => {
                const wallet = walletData.find(w => w.user_id === profile.id);
                return { ...profile, balance: wallet ? wallet.balance : 0 };
            });
            setUsers(combinedUsers)
            setFilteredUsers(combinedUsers)
        }
      } catch (err: any) {
          console.error("Admin Load Error:", err.message)
      } finally {
          setLoading(false)
      }
  }

  // --- HANDLERS ---

  // 1. CREATE / EDIT VENUE
  const openEditVenue = (v: any) => {
      setVenueForm({
          id: v.id,
          name: v.name,
          location: v.location,
          type: v.type,
          description: v.description || '',
          google_maps_url: v.google_maps_url || '',
          image_url: v.image_url
      })
      setVenueImage(null)
      setIsEditVenueOpen(true)
  }

  const handleVenueSubmit = async (isEdit: boolean) => {
      if (!venueForm.name || !venueForm.location) return alert("Fill required fields!")
      if (!isEdit && !venueImage) return alert("Image required for new venue!")

      setIsSubmittingVenue(true)
      try {
          let imageUrl = venueForm.image_url

          // Upload new image if selected
          if (venueImage) {
              const fileExt = venueImage.name.split('.').pop()
              const fileName = `venue-${Date.now()}.${fileExt}`
              await supabase.storage.from('venues').upload(fileName, venueImage)
              const { data } = supabase.storage.from('venues').getPublicUrl(fileName)
              imageUrl = data.publicUrl
          }

          const venueData = {
              name: venueForm.name,
              location: venueForm.location,
              type: venueForm.type,
              description: venueForm.description,
              google_maps_url: venueForm.google_maps_url,
              image_url: imageUrl,
              rating: 5.0 
          }

          if (isEdit) {
              await supabase.from('venues').update(venueData).eq('id', venueForm.id)
              alert("Venue Updated!")
          } else {
              await supabase.from('venues').insert(venueData)
              alert("Venue Created!")
          }

          setIsAddVenueOpen(false)
          setIsEditVenueOpen(false)
          setVenueForm({ id: '', name: '', location: '', type: 'Club', description: '', google_maps_url: '', image_url: '' })
          setVenueImage(null)
          fetchData()
      } catch (err: any) { alert("Error: " + err.message) } 
      finally { setIsSubmittingVenue(false) }
  }


  // 2. CREATE EVENT
  const handleCreateEvent = async () => {
      if (!newEvent.title || !newEvent.date || !eventImage) return alert("Fill required fields!")
      
      // If paid, price is required
      if (newEvent.ticket_type === 'paid' && !newEvent.price) return alert("Set a price for paid events!")
      // If external, url is required
      if (newEvent.ticket_type === 'external' && !newEvent.external_url) return alert("Set external URL!")

      setIsCreatingEvent(true)
      try {
          const fileExt = eventImage.name.split('.').pop()
          const fileName = `event-${Date.now()}.${fileExt}`
          await supabase.storage.from('events').upload(fileName, eventImage)
          const { data: urlData } = supabase.storage.from('events').getPublicUrl(fileName)

          await supabase.from('events').insert({
              venue_id: newEvent.venue_id,
              title: newEvent.title,
              date: new Date(newEvent.date).toISOString(),
              price_per_seat: newEvent.ticket_type === 'paid' ? Number(newEvent.price) : 0,
              ticket_type: newEvent.ticket_type,
              external_url: newEvent.external_url,
              image_url: urlData.publicUrl
          })
          alert("Event Published! 🎉")
          setIsAddEventOpen(false)
      } catch (err: any) { alert("Error: " + err.message) }
      finally { setIsCreatingEvent(false) }
  }

  const handleUpdateBonus = async () => {
      await supabase.from('system_config').update({ signup_bonus: systemConfig.signup_bonus }).eq('id', 1)
      alert("Bonus Updated!")
  }

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

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
      <button 
        onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${currentView === view ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
      >
          <Icon className="w-5 h-5" />
          {label}
      </button>
  )

  // SHARED FORM FOR CREATE/EDIT VENUE
  const VenueModalContent = ({ isEdit }: { isEdit: boolean }) => (
      <div className="space-y-4">
          <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">Cover Image</label>
              <div 
                  onClick={() => venueImageRef.current?.click()}
                  className="h-32 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center gap-2 bg-slate-950 transition-colors relative overflow-hidden"
              >
                  {/* Show preview of existing or new image */}
                  {venueImage ? (
                       <img src={URL.createObjectURL(venueImage)} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  ) : isEdit && venueForm.image_url ? (
                       <img src={venueForm.image_url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  ) : null}

                  <div className="relative z-10 flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 text-slate-300"/>
                      <span className="text-xs font-bold text-slate-300">{venueImage ? "Change Image" : "Upload Image"}</span>
                  </div>
                  <input type="file" ref={venueImageRef} className="hidden" accept="image/*" onChange={(e) => {if(e.target.files?.[0]) setVenueImage(e.target.files[0])}}/>
              </div>
          </div>
          <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Name</label><Input value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} className="bg-black border-slate-700 font-bold" placeholder="Venue Name"/></div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-400">Type</label>
                  <select value={venueForm.type} onChange={e => setVenueForm({...venueForm, type: e.target.value})} className="w-full h-10 bg-black border border-slate-700 rounded-md text-white px-3 font-bold text-sm outline-none">
                      <option value="Club">Club</option><option value="Cafe">Cafe</option><option value="Lounge">Lounge</option><option value="Concert">Concert</option>
                  </select>
              </div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Location</label><Input value={venueForm.location} onChange={e => setVenueForm({...venueForm, location: e.target.value})} className="bg-black border-slate-700 font-bold" placeholder="City"/></div>
          </div>
          <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Map Link</label><Input value={venueForm.google_maps_url} onChange={e => setVenueForm({...venueForm, google_maps_url: e.target.value})} className="bg-black border-slate-700 font-bold" placeholder="Google Maps URL"/></div>
          <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Description</label><Textarea value={venueForm.description} onChange={e => setVenueForm({...venueForm, description: e.target.value})} className="bg-black border-slate-700 font-bold" placeholder="Description..."/></div>
          <Button onClick={() => handleVenueSubmit(isEdit)} disabled={isSubmittingVenue} className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-12 text-lg mt-2">{isSubmittingVenue ? <Loader2 className="animate-spin"/> : (isEdit ? "Update Venue" : "Launch Live 🚀")}</Button>
      </div>
  )


  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col md:flex-row">
      
      {/* SIDEBAR */}
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
              <NavItem view="venues" icon={Building2} label="Venue & Events" />
              <NavItem view="cms" icon={FileText} label="Content Editor" />
              <NavItem view="settings" icon={Settings} label="System Settings" />
          </nav>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-slate-950 border-b border-slate-900 p-4 sticky top-0 z-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <ShieldAlert className="text-red-500 w-6 h-6" />
             <span className="font-black text-lg">GOD MODE</span>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </Button>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl md:hidden pt-24 px-6 space-y-4">
              <NavItem view="dashboard" icon={Home} label="Overview" />
              <NavItem view="users" icon={Users} label="User Economy" />
              <NavItem view="venues" icon={Building2} label="Venue & Events" />
              <NavItem view="cms" icon={FileText} label="Content Editor" />
              <NavItem view="settings" icon={Settings} label="System Settings" />
          </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-black/50">
          <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* DASHBOARD */}
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
                            <p className="text-3xl font-black text-green-400 mt-1">₹{(users.reduce((acc, u) => acc + (u.balance || 0), 0) / 1000).toFixed(1)}k</p>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <Building2 className="w-8 h-8 text-purple-500 mb-4" />
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Venues</h3>
                            <p className="text-3xl font-black text-white mt-1">{venues.length}</p>
                        </div>
                         <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                            <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Bonus Amount</h3>
                            <p className="text-3xl font-black text-white mt-1">₹{systemConfig.signup_bonus}</p>
                        </div>
                    </div>
                  </>
              )}

              {/* USERS */}
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
                                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
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
                                                    <span className="font-mono font-bold">₹{(user.balance || 0).toLocaleString()}</span>
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
                                    )) : (
                                        <tr><td colSpan={3} className="p-10 text-center text-slate-500 font-bold">No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                     </div>
                  </div>
              )}

              {/* VENUES & EVENTS */}
              {currentView === 'venues' && (
                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-black text-white">Venue Manager</h2>
                        <div className="flex gap-3">
                            {/* ADD EVENT BUTTON */}
                            <Button 
                                onClick={() => setIsAddEventOpen(true)}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-purple-900/20"
                            >
                                <Calendar className="w-5 h-5 mr-2" /> New Event
                            </Button>
                            {/* ADD VENUE BUTTON */}
                            <Button 
                                onClick={() => {
                                    setVenueForm({ id: '', name: '', location: '', type: 'Club', description: '', google_maps_url: '', image_url: '' })
                                    setVenueImage(null)
                                    setIsAddVenueOpen(true)
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-blue-900/20"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Add Venue
                            </Button>
                        </div>
                      </div>

                      {/* MODAL: ADD VENUE */}
                      {isAddVenueOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                              <div className="bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
                                  <button onClick={() => setIsAddVenueOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
                                  <h3 className="text-xl font-black text-white mb-6">Launch New Venue</h3>
                                  <VenueModalContent isEdit={false} />
                              </div>
                          </div>
                      )}

                      {/* MODAL: EDIT VENUE */}
                      {isEditVenueOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                              <div className="bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
                                  <button onClick={() => setIsEditVenueOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
                                  <h3 className="text-xl font-black text-white mb-6">Edit Venue</h3>
                                  <VenueModalContent isEdit={true} />
                              </div>
                          </div>
                      )}

                      {/* MODAL: ADD EVENT */}
                      {isAddEventOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
                              <div className="bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                                  <button onClick={() => setIsAddEventOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
                                  <h3 className="text-xl font-black text-white mb-6">Create New Party</h3>
                                  <div className="space-y-4">
                                      {/* Venue Select */}
                                      <div className="space-y-2">
                                          <label className="text-xs font-bold uppercase text-slate-400">Select Venue</label>
                                          <select value={newEvent.venue_id} onChange={(e) => setNewEvent({...newEvent, venue_id: e.target.value})} className="w-full h-12 bg-black border border-slate-700 rounded-xl text-white px-4 font-bold outline-none">
                                              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                          </select>
                                      </div>
                                      {/* Ticket Type */}
                                      <div className="space-y-2">
                                          <label className="text-xs font-bold uppercase text-slate-400">Ticket Type</label>
                                          <div className="grid grid-cols-4 gap-2">
                                              {['paid', 'free', 'rsvp', 'external'].map(type => (
                                                  <button
                                                      key={type}
                                                      onClick={() => setNewEvent({...newEvent, ticket_type: type})}
                                                      className={`h-10 rounded-lg text-xs font-bold uppercase border ${newEvent.ticket_type === type ? 'bg-purple-600 border-purple-600 text-white' : 'bg-black border-slate-700 text-slate-400'}`}
                                                  >
                                                      {type}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                      {/* Poster */}
                                      <div className="space-y-2">
                                          <label className="text-xs font-bold uppercase text-slate-400">Event Poster</label>
                                          <div onClick={() => eventImageRef.current?.click()} className="h-24 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500 cursor-pointer flex flex-col items-center justify-center gap-2 bg-slate-950 transition-colors">
                                              {eventImage ? <span className="text-xs font-bold text-green-500">{eventImage.name}</span> : <><ImageIcon className="w-6 h-6 text-slate-500"/><span className="text-xs font-bold text-slate-500">Upload</span></>}
                                              <input type="file" ref={eventImageRef} className="hidden" accept="image/*" onChange={(e) => {if(e.target.files?.[0]) setEventImage(e.target.files[0])}}/>
                                          </div>
                                      </div>
                                      <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Event Title</label><Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="bg-black border-slate-700 font-bold" placeholder="e.g. Saturday Night Jazz"/></div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Date</label><Input type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="bg-black border-slate-700 font-bold text-xs"/></div>
                                          
                                          {/* Conditional Price Input */}
                                          {newEvent.ticket_type === 'paid' && (
                                             <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-400">Price (₹)</label><Input type="number" value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: e.target.value})} className="bg-black border-slate-700 font-bold" placeholder="500"/></div>
                                          )}
                                      </div>

                                      {/* Conditional External Link */}
                                      {newEvent.ticket_type === 'external' && (
                                          <div className="space-y-2">
                                              <label className="text-xs font-bold uppercase text-slate-400">External Ticket URL</label>
                                              <Input value={newEvent.external_url} onChange={e => setNewEvent({...newEvent, external_url: e.target.value})} className="bg-black border-slate-700 font-bold" placeholder="https://bookmyshow.com/..."/>
                                          </div>
                                      )}

                                      <Button onClick={handleCreateEvent} disabled={isCreatingEvent} className="w-full bg-purple-600 hover:bg-purple-500 font-bold h-12 text-lg mt-2">{isCreatingEvent ? <Loader2 className="animate-spin"/> : "Publish Party 🎉"}</Button>
                                  </div>
                              </div>
                          </div>
                      )}
                      
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
                            <div key={v.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center group hover:border-slate-700 transition-all">
                                <div className="flex items-center gap-4">
                                    <img src={v.image_url} className="w-14 h-14 rounded-xl object-cover bg-slate-800 border border-slate-700"/>
                                    <div>
                                        <h4 className="font-bold text-white leading-tight">{v.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{v.type}</span>
                                            <span className="text-xs text-slate-500 flex items-center gap-0.5"><MapPin className="w-3 h-3"/> {v.location}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* EDIT BUTTON (NEW) */}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openEditVenue(v)}
                                    className="text-slate-500 hover:text-white hover:bg-slate-800"
                                >
                                    <Edit2 className="w-4 h-4"/>
                                </Button>
                            </div>
                        ))}
                     </div>
                  </div>
              )}

              {/* CMS */}
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

              {/* SETTINGS */}
              {currentView === 'settings' && (
                  <div className="space-y-6">
                      <h2 className="text-3xl font-black text-white">System Settings</h2>
                      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl max-w-2xl">
                          <div className="flex items-start gap-4 mb-8">
                              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
                                  <DollarSign className="w-6 h-6 text-yellow-500"/>
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-white">New User Bonus</h3>
                                  <p className="text-slate-400 text-sm mt-1">
                                      Automatically deposit this amount into the wallet of every new user who signs up.
                                  </p>
                              </div>
                          </div>
                          <div className="flex gap-4 items-end">
                              <div className="flex-1">
                                  <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Bonus Amount (₹)</label>
                                  <Input 
                                      type="number" 
                                      value={systemConfig.signup_bonus} 
                                      onChange={(e) => setSystemConfig({...systemConfig, signup_bonus: Number(e.target.value)})}
                                      className="bg-black border-slate-700 text-white font-mono text-lg h-14"
                                  />
                              </div>
                              <Button 
                                  onClick={handleUpdateBonus} 
                                  className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl"
                              >
                                  <Save className="w-5 h-5 mr-2" /> Save Config
                              </Button>
                          </div>
                      </div>
                  </div>
              )}

          </div>
      </main>
    </div>
  )
}