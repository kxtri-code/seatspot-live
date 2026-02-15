"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Star, MessageSquare, Send, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ReviewSection({ venueId }: { venueId: string }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        await fetchReviews()
        setLoading(false)
    }
    init()
  }, [])

  const fetchReviews = async () => {
    // We join 'profiles' to get the commenter's name and photo
    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles ( full_name, avatar_url )
      `)
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false })
    
    if (data) setReviews(data)
  }

  const handleSubmit = async () => {
    if (!user) return alert("Please login to review")
    if (!newComment.trim()) return

    setSubmitting(true)
    
    // Insert into DB (Now strictly matches the SQL we just fixed)
    const { error } = await supabase.from('reviews').insert({
      venue_id: venueId,
      user_id: user.id, // This matches the new column
      rating: rating,
      comment: newComment
    })

    if (error) {
      alert("Error posting review: " + error.message)
    } else {
      setNewComment('')
      setRating(5)
      await fetchReviews() // Instant refresh
    }
    setSubmitting(false)
  }

  if (loading) return <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Reviews <span className="text-slate-400 text-sm font-medium">({reviews.length})</span>
          </h3>
      </div>

      {/* COMPOSER (Only if logged in) */}
      {user ? (
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rate your experience</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90 hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
          </div>
          
          <div className="flex gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                 <User className="w-full h-full p-2 text-slate-400" />
             </div>
             <div className="flex-1 flex gap-2">
                 <Input 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your vibe..." 
                    className="bg-white border-slate-200 h-12 rounded-xl"
                 />
                 <Button 
                    onClick={handleSubmit} 
                    disabled={submitting} 
                    size="icon" 
                    className="bg-blue-600 h-12 w-12 rounded-xl shrink-0"
                 >
                   {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
                 </Button>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-xl text-blue-600 text-sm font-bold text-center border border-blue-100">
            Please login to write a review.
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {reviews.length > 0 ? reviews.map(review => (
          <div key={review.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
             <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                      {review.profiles?.avatar_url ? (
                          <img src={review.profiles.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                          <User className="w-full h-full p-2 text-slate-300" />
                      )}
                   </div>
                   <div>
                      <div className="font-bold text-sm text-slate-900">{review.profiles?.full_name || 'Guest User'}</div>
                      <div className="flex text-yellow-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                   </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                    {new Date(review.created_at).toLocaleDateString()}
                </span>
             </div>
             <p className="text-slate-600 text-sm leading-relaxed font-medium pl-14">
                 "{review.comment}"
             </p>
          </div>
        )) : (
            <div className="text-center py-10 opacity-50">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-400">No reviews yet. Be the first!</p>
            </div>
        )}
      </div>
    </div>
  )
}