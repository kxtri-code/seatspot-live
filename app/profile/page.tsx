"use client"

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, User, Save, LogOut, Camera, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // User Data
  const [user, setUser] = useState<any>(null)
  const [fullname, setFullname] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // 1. Fetch Profile on Load
  const getProfile = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
         router.replace('/login') // Redirect if not logged in
         return
      }

      setUser(user)

      // Fetch profile data
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name, username, avatar_url`)
        .eq('id', user.id)
        .single()

      if (data) {
        setFullname(data.full_name || '')
        setUsername(data.username || '')
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    getProfile()
  }, [getProfile])

  // 2. The "Magic" Update Function (Uses Upsert)
  async function updateProfile() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user logged in')

      const updates = {
        id: user.id, // Required for Upsert
        full_name: fullname,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      // ERROR FIX: .upsert() handles both creating AND updating
      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error
      alert('Profile updated successfully! ✅')
      
    } catch (error: any) {
      alert('Error updating profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 3. Avatar Uploader
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to 'avatars' bucket (Make sure this bucket exists in Supabase Storage!)
      // If 'avatars' bucket doesn't exist, create it or change this to 'stories' temporarily
      const { error: uploadError } = await supabase.storage.from('stories').upload(filePath, file)

      if (uploadError) throw uploadError
      
      const { data } = supabase.storage.from('stories').getPublicUrl(filePath)
      setAvatarUrl(data.publicUrl)

    } catch (error: any) {
      alert('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.replace('/')
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin w-8 h-8 text-slate-900" /></div>

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-6 sticky top-0 z-10 flex justify-between items-center">
            <h1 className="text-xl font-black text-slate-900">My Profile</h1>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-500 hover:bg-red-50 font-bold">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
        </div>

        <div className="max-w-md mx-auto p-6 space-y-8">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-200">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-full h-full p-6 text-slate-400" />
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-500 transition-colors">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                        <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
                    </label>
                </div>
                <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.email}</p>
            </div>

            {/* Form Section */}
            <div className="space-y-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-400">Email</Label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 cursor-not-allowed">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-bold">{user?.email}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullname" className="text-xs font-bold uppercase text-slate-400">Full Name</Label>
                    <Input 
                        id="fullname" 
                        value={fullname} 
                        onChange={(e) => setFullname(e.target.value)} 
                        className="h-12 rounded-xl border-slate-200 font-bold"
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-bold uppercase text-slate-400">Username / Handle</Label>
                    <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="h-12 rounded-xl border-slate-200 font-bold"
                        placeholder="e.g. @johnny"
                    />
                </div>

                <Button 
                    onClick={updateProfile} 
                    disabled={loading} 
                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-lg shadow-lg mt-4"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    Save Changes
                </Button>
            </div>

             {/* Admin Link (Only visible if you want to quick-link it) */}
             <div className="text-center">
                <Button variant="link" onClick={() => router.push('/super-admin')} className="text-slate-300 text-xs uppercase tracking-widest hover:text-blue-600">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Admin Access
                </Button>
             </div>

        </div>
    </div>
  )
}