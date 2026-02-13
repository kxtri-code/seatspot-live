"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, Smartphone, CheckCircle, ShieldCheck } from 'lucide-react'

export default function PaymentModal({ isOpen, onClose, seat, onSuccess }: any) {
  const [step, setStep] = useState('summary') // summary | processing | success
  const [method, setMethod] = useState('upi') // upi | card

  const PRICE = 500 // Base Price
  const TAX = 90 // GST
  const TOTAL = PRICE + TAX

  const handlePay = () => {
    setStep('processing')
    // Simulate Bank Delay
    setTimeout(() => {
        setStep('success')
        // Wait for animation then close
        setTimeout(() => {
            onSuccess()
        }, 2000)
    }, 2500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-3xl">
        
        {/* HEADER (Dynamic based on step) */}
        <div className="bg-slate-900 p-6 text-white text-center">
            {step === 'summary' && (
                <>
                    <h2 className="text-xl font-bold">Checkout</h2>
                    <p className="text-slate-400 text-sm">Secure Payment Gateway</p>
                </>
            )}
            {step === 'processing' && (
                <>
                    <h2 className="text-xl font-bold animate-pulse">Processing...</h2>
                    <p className="text-slate-400 text-sm">Contacting Bank</p>
                </>
            )}
            {step === 'success' && (
                <>
                    <h2 className="text-xl font-bold text-green-400">Payment Successful</h2>
                    <p className="text-slate-400 text-sm">Redirecting...</p>
                </>
            )}
        </div>

        <div className="p-6">
            {step === 'summary' && (
                <div className="space-y-6">
                    {/* ORDER SUMMARY */}
                    <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Table Reservation ({seat?.label})</span>
                            <span className="font-bold">₹{PRICE}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Convenience Fee + GST</span>
                            <span className="font-bold">₹{TAX}</span>
                        </div>
                        <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-lg font-black text-slate-900">
                            <span>Total Pay</span>
                            <span>₹{TOTAL}</span>
                        </div>
                    </div>

                    {/* PAYMENT METHOD */}
                    <div className="grid grid-cols-2 gap-3">
                        <div 
                            onClick={() => setMethod('upi')}
                            className={`p-3 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-2 transition-all ${method === 'upi' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                        >
                            <Smartphone className={`w-6 h-6 ${method === 'upi' ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold">UPI / GPay</span>
                        </div>
                        <div 
                            onClick={() => setMethod('card')}
                            className={`p-3 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-2 transition-all ${method === 'card' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                        >
                            <CreditCard className={`w-6 h-6 ${method === 'card' ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold">Card</span>
                        </div>
                    </div>

                    <Button onClick={handlePay} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-green-900/20 text-lg">
                        Pay ₹{TOTAL}
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase font-bold">
                        <ShieldCheck className="w-3 h-3" /> 256-bit SSL Secured
                    </div>
                </div>
            )}

            {step === 'processing' && (
                <div className="py-10 flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="mt-6 text-sm text-slate-500 font-medium">Please do not close this window...</p>
                </div>
            )}

            {step === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Booking Confirmed!</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-[200px]">Your QR Code has been generated.</p>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}