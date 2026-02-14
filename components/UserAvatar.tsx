"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { User } from 'lucide-react'

export default function UserAvatar({ className }: { className?: string }) {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvatar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single()
        
        if (data?.avatar_url) setAvatarUrl(data.avatar_url)
      }
    }
    fetchAvatar()
  }, [])

  return (
    <button 
      onClick={() => router.push('/profile')}
      className={`relative rounded-full overflow-hidden border border-white/20 hover:scale-105 transition-transform shadow-md ${className}`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500">
          <User className="w-1/2 h-1/2" />
        </div>
      )}
    </button>
  )
}