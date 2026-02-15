"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Bell, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Fetch on load
  useEffect(() => {
    fetchNotifications()

    // Real-time subscription (Optional: makes it pop instantly)
    const channel = supabase
      .channel('notif_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
          fetchNotifications()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  const markAsRead = async () => {
      if (unreadCount === 0) return
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      
      setUnreadCount(0)
      fetchNotifications()
  }

  return (
    <div className="relative">
        {/* BELL ICON */}
        <button 
            onClick={() => { setIsOpen(!isOpen); markAsRead(); }}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors relative"
        >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
        </button>

        {/* DROPDOWN / DRAWER */}
        {isOpen && (
            <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 origin-top-right z-50">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                    <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-slate-400"/></button>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex gap-3">
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                <div>
                                    <p className="font-bold text-slate-900 text-xs mb-1">{n.title}</p>
                                    <p className="text-slate-500 text-xs leading-relaxed">{n.message}</p>
                                    <p className="text-[10px] text-slate-300 font-bold mt-2">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-slate-400 text-xs">No new notifications</div>
                    )}
                </div>
            </div>
        )}
    </div>
  )
}