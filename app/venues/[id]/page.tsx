"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Star, Info, Utensils, Phone, ArrowLeft, Send, User } from 'lucide-react'
import Link from 'next/link'

export default function VenueProfile() {
  const params = useParams()
  const [venue, setVenue] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [newRating, setNewRating] = useState(5)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.id) return
      
      // Fetch Venue
      const { data: v } = await supabase.from('venues').select('*').eq('id', params.id).single()
      if (v) setVenue(v)

      // Fetch Reviews
      const { data: r } = await supabase.from('reviews').select('*').eq('venue_id', params.id).order('created_at', { ascending: false })
      if (r) setReviews(r)
      
      setLoading(false)
    }
    fetchData()
  }, [params?.id])

  const postReview = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert("Please login to review!")

    const review = {
        venue_id: params.id,
        user_email: session.user.email,
        rating: newRating,
        comment: newComment
    }

    const { error } = await supabase.from('reviews').insert([review])
    if (!error) {
        setReviews([review, ...reviews])
        setNewComment('')
        alert("Review Posted!")
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Vibe...</div>
  if (!venue) return <div className="min-h-screen flex items-center justify-center">Venue not found</div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="relative h-[40vh] w-full bg-slate-900">
        <img src={venue.image_url} className="w-full h-full object-cover opacity-70" alt={venue.name} />
        <div className="absolute top-6 left-6 z-10">
          <Link href="/">
            <Button variant="outline" className="bg-white/20 text-white backdrop-blur-md border-white/30 hover:bg-white/40">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-10 pb-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">{venue.name}</h1>
              <p className="flex items-center gap-1 text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-blue-500" /> {venue.location}
              </p>
            </div>
            <div className="text-center">
                <div className="flex items-center gap-1 justify-center bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                    <span className="text-3xl font-black text-slate-900">{venue.rating}</span>
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500"/>
                </div>
                <p className="text-xs text-slate-400 mt-1">{reviews.length} Reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12 pt-12 border-t border-slate-100">
            {/* LEFT: INFO */}
            <div className="md:col-span-2 space-y-10">
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900"><Info className="text-blue-500 w-5 h-5" /> About</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{venue.description}</p>
              </section>
              
              {/* REVIEWS SECTION */}
              <section>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900"><Star className="text-yellow-500 w-5 h-5" /> Fan Reviews</h3>
                
                {/* Review Input */}
                <div className="bg-slate-50 p-4 rounded-2xl mb-8 flex gap-3">
                    <Input 
                        placeholder="Share your experience..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-white border-slate-200"
                    />
                    <Button onClick={postReview} className="bg-blue-600 hover:bg-blue-700 text-white"><Send className="w-4 h-4"/></Button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    {reviews.map((r, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl flex gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm text-slate-900">{r.user_email?.split('@')[0]}</span>
                                    <div className="flex text-yellow-500">
                                        {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm">{r.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </section>
            </div>

            {/* RIGHT: CONTACT */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                <h4 className="font-bold text-lg mb-4 border-b border-white/10 pb-2">Reserve Table</h4>
                <div className="space-y-4">
                  <p className="flex items-center gap-3 text-sm text-slate-300"><Phone className="w-4 h-4 text-blue-400" /> +91 98765 43210</p>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold">Book Now</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}