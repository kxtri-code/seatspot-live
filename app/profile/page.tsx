"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, ArrowLeft, Mail, Lock, User, LogOut, Camera, Save, Bell, Shield, Phone, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch' 
// If Switch doesn't exist, run: npx shadcn@latest add switch

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    marketing_opt_in: false,
    avatar_url: ''
  })
  
  // Password State
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // --- INIT ---
  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
        setUser(user)
        // Fetch detailed profile
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        
        if (data) {
            setProfile(data)
            setFormData({
                full_name: data.full_name || '',
                phone: data.phone || '',
                marketing_opt_in: data.marketing_opt_in || false,
                avatar_url: data.avatar_url || ''
            })
        }
    }
    setLoading(false)
  }

  // --- HANDLERS ---
  
  // 1. Upload Avatar
  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      setFormData({ ...formData, avatar_url: data.publicUrl })
      
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  // 2. Save Profile Updates
  const updateProfile = async () => {
      setUploading(true)
      const { error } = await supabase
          .from('profiles')
          .update({
              full_name: formData.full_name,
              phone: formData.phone,
              marketing_opt_in: formData.marketing_opt_in,
              avatar_url: formData.avatar_url,
              updated_at: new Date()
          })
          .eq('id', user.id)

      if (error) {
          alert("Error updating profile!")
      } else {
          setIsEditing(false)
          getProfile() // Refresh
      }
      setUploading(false)
  }

  // 3. Change Password
  const updatePassword = async () => {
      setPasswordLoading(true)
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) alert("Error: " + error.message)
      else {
          alert("Password updated successfully!")
          setNewPassword('')
      }
      setPasswordLoading(false)
  }

  const handleLogout = async () => {
      await supabase.auth.signOut()
      router.push('/')
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-900"/></div>

  if (!user) return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
          <p>Please login to view your profile.</p>
          <Button onClick={() => router.push('/login')}>Login</Button>
      </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
         <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full">
            <ArrowLeft className="text-slate-900"/>
         </Button>
         <h1 className="text-lg font-black text-slate-900">My Identity</h1>
         <div className="w-8" /> 
      </div>

      <div className="p-6 space-y-8 max-w-lg mx-auto">
          
          {/* --- SECTION 1: IDENTITY CARD (READ ONLY) --- */}
          {!isEditing ? (
            <>
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-72 flex flex-col justify-between group transition-all hover:scale-[1.02]">
                    {/* Dynamic Background */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-30 -mr-20 -mt-20 pointer-events-none" />
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-4">
                            {/* Avatar Display */}
                            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500"><User /></div>
                                )}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member</div>
                                <h2 className="text-xl font-black">{profile?.full_name || 'Anonymous User'}</h2>
                            </div>
                        </div>
                        <Shield className="w-8 h-8 text-blue-400 opacity-80" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-mono tracking-widest text-white/90">.... .... {user.id.slice(0,4)}</span>
                        </div>
                        <div className="flex justify-between items-end mt-4 border-t border-white/10 pt-4">
                            <div>
                                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Joined</div>
                                <div className="font-mono text-xs">2026</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Status</div>
                                <div className="text-xs font-bold text-green-400 flex items-center gap-1 justify-end">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="grid gap-4">
                    <Button 
                        onClick={() => setIsEditing(true)}
                        className="h-16 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl shadow-sm hover:bg-slate-50 justify-start px-6 text-lg"
                    >
                        <User className="w-5 h-5 mr-3 text-blue-600" /> Edit Profile Details
                    </Button>
                    <Button 
                        onClick={() => router.push('/tickets')}
                        className="h-16 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl shadow-sm hover:bg-slate-50 justify-start px-6 text-lg"
                    >
                        <Ticket className="w-5 h-5 mr-3 text-purple-600" /> View My Wallet
                    </Button>
                </div>
            </>
          ) : (
            // --- SECTION 2: EDIT MODE ---
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                
                {/* 1. PHOTO UPLOAD */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32">
                        <div className="w-32 h-32 rounded-full bg-slate-200 overflow-hidden border-4 border-white shadow-xl">
                             {formData.avatar_url ? (
                                <img src={formData.avatar_url} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-12 h-12"/></div>
                             )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4" />}
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={uploadAvatar}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tap to change photo</p>
                </div>

                {/* 2. PERSONAL DETAILS */}
                <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-900 flex items-center gap-2"><User className="w-4 h-4"/> Personal Info</h3>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                        <Input 
                            value={formData.full_name}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                            className="bg-slate-50 border-slate-200"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <Input 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                className="pl-10 bg-slate-50 border-slate-200"
                                placeholder="+91 00000 00000"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Email (Locked)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <Input value={user.email} disabled className="pl-10 bg-slate-100 border-slate-200 text-slate-500" />
                        </div>
                    </div>
                </div>

                {/* 3. NOTIFICATIONS */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2"><Bell className="w-4 h-4"/> Get Updates</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Receive offers and venue updates on your dashboard.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Custom Toggle using Shadcn or Standard Checkbox styled */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={formData.marketing_opt_in}
                            onChange={(e) => setFormData({...formData, marketing_opt_in: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* 4. SECURITY */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                     <h3 className="font-black text-slate-900 flex items-center gap-2"><Lock className="w-4 h-4"/> Security</h3>
                     <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">New Password</label>
                        <div className="flex gap-2">
                            <Input 
                                type="password" 
                                placeholder="Min 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-slate-50 border-slate-200"
                            />
                            <Button 
                                onClick={updatePassword} 
                                disabled={!newPassword || passwordLoading}
                                size="sm"
                                className="bg-slate-900"
                            >
                                {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Update'}
                            </Button>
                        </div>
                     </div>
                </div>

                {/* SAVE BUTTONS */}
                <div className="flex gap-3 pt-4">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-12 rounded-xl"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg"
                        onClick={updateProfile}
                        disabled={uploading}
                    >
                        {uploading ? <Loader2 className="animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>
          )}

          {/* LOGOUT (Always visible at bottom) */}
          <div className="pt-8 text-center">
              <button 
                onClick={handleLogout}
                className="text-red-400 font-bold text-xs uppercase tracking-widest hover:text-red-600 flex items-center justify-center gap-2 mx-auto"
              >
                  <LogOut className="w-4 h-4" /> Sign Out
              </button>
          </div>

      </div>
    </div>
  )
}