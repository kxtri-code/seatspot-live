"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 1. GOOGLE LOGIN (With Dynamic Redirect Fix)
  const handleGoogleLogin = async () => {
    setLoading(true)
    
    // DYNAMIC URL DETECTION
    // This ensures that if you are on 'seatspot-live.vercel.app', 
    // it redirects there, not to localhost.
    const origin = (typeof window !== 'undefined' && window.location.origin) 
      ? window.location.origin 
      : ''
      
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) {
        setError(error.message)
        setLoading(false)
    }
  }

  // 2. EMAIL LOGIN
  const handleEmailAuth = async () => {
    setLoading(true)
    setError(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else {
        alert("Check your email for the confirmation link!")
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else {
        router.push('/') 
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      
      {/* LEFT: BRANDING IMAGE */}
      <div className="hidden md:flex flex-col justify-between bg-slate-900 relative p-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-60">
            <img 
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80" 
                className="w-full h-full object-cover" 
                alt="Party Crowd"
            />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        <div className="relative z-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl mb-4">S</div>
            <h1 className="text-4xl font-black tracking-tighter">SeatSpot.</h1>
        </div>

        <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-bold leading-tight">
                "The easiest way to discover the city's heartbeat."
            </h2>
            <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">Events</Badge>
                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">Dining</Badge>
                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20">Nightlife</Badge>
            </div>
        </div>
      </div>

      {/* RIGHT: LOGIN FORM */}
      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md space-y-8">
            
            <div className="text-center md:text-left">
                <h2 className="text-3xl font-black text-slate-900">
                    {isSignUp ? "Create an account" : "Welcome back"}
                </h2>
                <p className="text-slate-500 mt-2">
                    {isSignUp ? "Join thousands of party-goers." : "Enter your details to access your account."}
                </p>
            </div>

            <div className="space-y-4">
                {/* GOOGLE BUTTON */}
                <Button 
                    onClick={handleGoogleLogin} 
                    variant="outline" 
                    className="w-full py-6 text-base font-bold border-slate-300 hover:bg-slate-50 relative flex items-center gap-3"
                    disabled={loading}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Or continue with email</span></div>
                </div>

                {/* EMAIL INPUTS */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <Input 
                                placeholder="name@example.com" 
                                className="pl-10 h-12 bg-slate-50 border-slate-200" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <Input 
                                type="password" 
                                placeholder="••••••••" 
                                className="pl-10 h-12 bg-slate-50 border-slate-200" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                        {error}
                    </div>
                )}

                <Button 
                    onClick={handleEmailAuth} 
                    disabled={loading}
                    className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
                    {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                </Button>

                <div className="text-center">
                    <button 
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}