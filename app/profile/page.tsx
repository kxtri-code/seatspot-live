"use client"

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, User, Save, LogOut, Camera, Mail, Shield, Bell, Key, Wallet, Sparkles, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Data State
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    avatar_url: '',
    marketing_opt_in: false,
    website: ''
  })
  const [walletBalance, setWalletBalance] = useState(0)

  // Password State
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Fetch Data
  const getProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.replace('/login')

      setUser(user)

      // Parallel Fetch: Profile + Wallet
      const [profileData, walletData] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('wallets').select('balance').eq('user_id', user.id).single()
      ])

      if (profileData.data) {
          setProfile({
              full_name: profileData.data.full_name || '',
              username: profileData.data.username || '',
              avatar_url: profileData.data.avatar_url || '',
              marketing_opt_in: profileData.data.marketing_opt_in || false,
              website: ''
          })
      }
      if (walletData.data) setWalletBalance(walletData.data.balance)

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { getProfile() }, [getProfile])

  // --- HANDLERS ---

  const handleSave = async () => {
      setSaving(true)
      try {
          // 1. Update Profile Data
          const updates = {
              id: user.id,
              ...profile,
              updated_at: new Date().toISOString(),
          }
          const { error: profileError } = await supabase.from('profiles').upsert(updates)
          if (profileError) throw profileError

          // 2. Update Password (If typed)
          if (newPassword.trim()) {
              const { error: pwError } = await supabase.auth.updateUser({ password: newPassword })
              if (pwError) throw pwError
              setNewPassword('') // Clear after save
              alert("Settings & Password Updated! 🔒")
          } else {
              alert("Profile Updated! ✨")
          }

      } catch (err: any) {
          alert("Error: " + err.message)
      } finally {
          setSaving(false)
      }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return
      setSaving(true)
      try {
          const file = e.target.files[0]
          const fileExt = file.name.split('.').pop()
          // FIX: Changed Math.now() to Date.now()
          const fileName = `${user.id}-${Date.now()}.${fileExt}`
          
          // Upload
          const { error } = await supabase.storage.from('stories').upload(fileName, file)
          if (error) throw error
          
          // Get URL
          const { data } = supabase.storage.from('stories').getPublicUrl(fileName)
          setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }))
          
          // Auto-save
          await supabase.from('profiles').upsert({ 
              id: user.id, 
              avatar_url: data.publicUrl,
              updated_at: new Date().toISOString()
          })
      } catch (err: any) {
          alert("Upload failed: " + err.message)
      } finally {
          setSaving(false)
      }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-900"/></div>

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">Account Center</h1>
          </div>
          <Button variant="ghost" onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-widest">
              Log Out <LogOut className="w-3 h-3 ml-2" />
          </Button>
      </div>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* COL 1: IDENTITY CARD */}
          <div className="md:col-span-1 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-purple-600 opacity-10 group-hover:opacity-20 transition-opacity" />
              
              <div className="relative mt-8 mb-4">
                  <div className="w-32 h-32 rounded-full p-1 bg-white shadow-2xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-full h-full p-6 text-slate-300" />
                        )}
                    </div>
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4" />}
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
                  </label>
              </div>

              <h2 className="text-2xl font-black text-slate-900 text-center mb-1">{profile.full_name || 'Anonymous User'}</h2>
              <p className="text-slate-400 font-bold text-sm mb-6">@{profile.username || 'username'}</p>

              {/* Wallet Card */}
              <div className="w-full bg-slate-900 rounded-2xl p-4 text-white mb-6 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Wallet Balance</span>
                      <Wallet className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-3xl font-black tracking-tight">₹{walletBalance.toLocaleString()}</div>
                  <Button variant="link" onClick={() => router.push('/tickets')} className="text-green-400 text-xs p-0 h-auto mt-2 font-bold hover:text-green-300">View History &rarr;</Button>
              </div>

              <div className="w-full border-t border-slate-100 pt-6 mt-auto">
                 <div className="flex items-center gap-3 text-slate-500 mb-2">
                     <Mail className="w-4 h-4" />
                     <span className="text-xs font-bold truncate">{user?.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-500">
                     <Shield className="w-4 h-4" />
                     <span className="text-xs font-bold">Verified Member</span>
                 </div>
              </div>
          </div>

          {/* COL 2 & 3: SETTINGS GRID */}
          <div className="md:col-span-2 space-y-6">
              
              {/* 1. PERSONAL DETAILS */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-slate-400">Full Name</Label>
                          <Input 
                            value={profile.full_name} 
                            onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                            className="h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold"
                          />
                      </div>
                      <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-slate-400">Username</Label>
                          <Input 
                            value={profile.username} 
                            onChange={(e) => setProfile({...profile, username: e.target.value})} 
                            className="h-12 bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold"
                            placeholder="@handle"
                          />
                      </div>
                  </div>
              </div>

              {/* 2. SPLIT ROW: PREFERENCES & SECURITY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Marketing */}
                  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                              <Bell className="w-4 h-4 text-purple-500" /> Preferences
                          </h3>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                              Receive exclusive offers, venue updates, and party invites directly.
                          </p>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                          <span className="text-sm font-bold text-slate-700">Email Updates</span>
                          <Switch 
                            checked={profile.marketing_opt_in}
                            onCheckedChange={(v) => setProfile({...profile, marketing_opt_in: v})}
                          />
                      </div>
                  </div>

                  {/* SECURITY */}
                  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                              <Key className="w-4 h-4 text-orange-500" /> Change Password
                          </h3>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                              Update your password securely right here.
                          </p>
                      </div>
                      <div className="relative">
                          <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="New Password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="h-12 pr-10 bg-slate-50 border-slate-100 focus:bg-white transition-all font-bold"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                          >
                              {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                          </button>
                      </div>
                  </div>
              </div>

              {/* SAVE ACTION */}
              <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="h-14 px-10 rounded-full bg-slate-900 hover:bg-black text-white font-black text-lg shadow-xl shadow-slate-300 transition-all hover:scale-105 active:scale-95"
                  >
                      {saving ? <Loader2 className="animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2" />}
                      Save Changes
                  </Button>
              </div>

          </div>
      </div>
    </div>
  )
}