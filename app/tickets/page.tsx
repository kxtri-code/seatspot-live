"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, Ticket, Wallet, ArrowDownLeft, ArrowUpRight, History, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import QRCode from 'react-qr-code' 
// NOTE: If you don't have react-qr-code, install it: npm install react-qr-code

export default function WalletPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Data State
  const [wallet, setWallet] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/profile') // Redirect if guest
    setUser(user)

    // 1. Get Wallet Balance
    const { data: wData } = await supabase.from('wallets').select('*').eq('user_id', user.id).single()
    if (wData) setWallet(wData)

    // 2. Get Active Tickets
    const { data: tData } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'confirmed') // Only active tickets
        .order('date', { ascending: true })
    if (tData) setTickets(tData)

    // 3. Get Transactions (History)
    if (wData) {
        const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('wallet_id', wData.id)
            .order('created_at', { ascending: false })
        if (txData) setTransactions(txData)
    }

    setLoading(false)
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-900"/></div>

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16 pointer-events-none"/>
          
          <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-black flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-blue-400" /> My Wallet
                  </h1>
                  <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">VIP Member</span>
              </div>

              <div className="text-center py-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
                  <h2 className="text-5xl font-black tracking-tight">
                      ₹{wallet?.balance?.toLocaleString() || '0'}
                  </h2>
              </div>

              <div className="flex gap-4 mt-6">
                  <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl h-12 shadow-lg shadow-green-900/20">
                      <ArrowDownLeft className="w-4 h-4 mr-2" /> Top Up
                  </Button>
                  <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 font-bold rounded-xl h-12">
                      <History className="w-4 h-4 mr-2" /> Statement
                  </Button>
              </div>
          </div>
      </div>

      <div className="p-6 -mt-8 relative z-20 space-y-8">
          
          {/* SECTION 1: ACTIVE TICKETS */}
          <div>
              <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-600" /> Your Passes ({tickets.length})
              </h3>
              
              <div className="space-y-4">
                  {tickets.map(ticket => (
                      <div key={ticket.id} className="bg-white rounded-[1.5rem] p-0 shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                          <div className="p-5 flex justify-between items-start bg-slate-900 text-white relative overflow-hidden">
                              <div className="relative z-10">
                                  <h4 className="font-black text-xl">{ticket.venue_name}</h4>
                                  <p className="text-sm text-slate-300 font-medium mt-1">{new Date(ticket.date).toDateString()}</p>
                              </div>
                              <div className="text-right relative z-10">
                                  <span className="block text-2xl font-black text-blue-400">{ticket.admit_count}</span>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Guests</span>
                              </div>
                              {/* Ticket Notch Effect */}
                              <div className="absolute -bottom-3 left-0 w-full h-6 bg-white rounded-t-xl" />
                          </div>
                          
                          <div className="p-6 flex flex-col items-center justify-center bg-white border-t border-dashed border-slate-200 relative">
                               {/* Notches */}
                               <div className="absolute top-[-12px] left-[-12px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100" />
                               <div className="absolute top-[-12px] right-[-12px] w-6 h-6 bg-slate-50 rounded-full border border-slate-100" />

                               <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-inner mb-4">
                                   <QRCode value={`ID: ${ticket.id}`} size={120} />
                               </div>
                               <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Scan at Entry • ID: {ticket.id.slice(0,6)}</p>
                          </div>
                      </div>
                  ))}
                  {tickets.length === 0 && (
                      <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                          <Ticket className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="text-sm font-bold text-slate-400">No active tickets.</p>
                          <Button variant="link" onClick={() => router.push('/explore')} className="text-blue-600 font-bold">Find a party?</Button>
                      </div>
                  )}
              </div>
          </div>

          {/* SECTION 2: TRANSACTIONS */}
          <div>
              <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-400" /> Recent Activity
              </h3>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  {transactions.map((tx, i) => (
                      <div key={tx.id} className={`p-4 flex justify-between items-center ${i !== transactions.length - 1 ? 'border-b border-slate-50' : ''}`}>
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                  {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                              </div>
                              <div>
                                  <p className="font-bold text-slate-900 text-sm">{tx.description}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(tx.created_at).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <span className={`font-black text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                              {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

      </div>
    </div>
  )
}