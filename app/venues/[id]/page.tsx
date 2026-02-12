// ... Find the "RIGHT COLUMN" / "Sticky Booking Card" section ...

<div className="hidden lg:block space-y-6">
  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-24">
    <h4 className="font-bold text-lg mb-4 border-b border-white/10 pb-4">Plan Your Visit</h4>
    
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-xl">
        <Phone className="w-4 h-4 text-blue-400" /> 
        <span>+91 98765 43210</span>
      </div>
      
      {/* FIX: Solid White Button for High Contrast */}
      <Button 
        onClick={openMaps} 
        className="w-full bg-white text-slate-900 hover:bg-slate-200 font-black flex gap-2 h-12 rounded-xl transition-all"
      >
        <Navigation className="w-4 h-4 text-blue-600" /> Get Directions
      </Button>
    </div>

    <div className="mt-6 pt-6 border-t border-white/10">
        <Button 
            onClick={scrollToBooking} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 text-lg rounded-xl shadow-lg shadow-blue-900/50"
        >
            Book a Table
        </Button>
        <p className="text-center text-xs text-slate-500 mt-3">Instant confirmation • No booking fees</p>
    </div>
  </div>
</div>