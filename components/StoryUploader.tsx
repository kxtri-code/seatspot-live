"use client"

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { X, Camera, MapPin, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StoryUploaderProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function StoryUploader({ onClose, onUploadComplete }: StoryUploaderProps) {
  const [venues, setVenues] = useState<any[]>([])
  const [selectedVenue, setSelectedVenue] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fetch venues so user can tag where they are
    const getVenues = async () => {
        const { data } = await supabase.from('venues').select('id, name')
        if(data) setVenues(data)
    }
    getVenues()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const f = e.target.files[0]
          setFile(f)
          setPreview(URL.createObjectURL(f))
      }
  }

  const handleUpload = async () => {
      if (!file || !selectedVenue) return alert("Please select a photo and a venue!")
      
      setUploading(true)
      try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) throw new Error("You must be logged in")

          // 1. Upload Image
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
             .from('stories')
             .upload(fileName, file)
          
          if (uploadError) throw uploadError

          const { data: publicUrlData } = supabase.storage.from('stories').getPublicUrl(fileName)

          // 2. Insert into DB
          const { error: dbError } = await supabase.from('stories').insert({
              venue_id: selectedVenue,
              media_url: publicUrlData.publicUrl,
              caption: "User Vibe Check" 
          })

          if (dbError) throw dbError

          onUploadComplete() // Refresh the feed

      } catch (err: any) {
          alert("Upload failed: " + err.message)
      } finally {
          setUploading(false)
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
        <div className="bg-slate-900 w-full max-w-md h-[90vh] sm:h-auto sm:rounded-3xl rounded-t-[2rem] relative flex flex-col overflow-hidden shadow-2xl border border-slate-800">
            
            {/* HEADER */}
            <div className="p-4 flex justify-between items-center z-20">
                <h3 className="text-white font-black text-lg">Add to Story</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* PREVIEW AREA */}
            <div className="flex-1 bg-black relative flex flex-col items-center justify-center">
                {preview ? (
                    <img src={preview} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                ) : (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-4 text-slate-500 cursor-pointer p-10"
                    >
                        <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">Tap to Snap</p>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileSelect}
                />
            </div>

            {/* CONTROLS */}
            <div className="p-6 bg-slate-900 z-20 space-y-4">
                
                {/* VENUE SELECTOR */}
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Where are you?
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {venues.map(v => (
                            <button
                                key={v.id}
                                onClick={() => setSelectedVenue(v.id)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedVenue === v.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                            >
                                {v.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* UPLOAD BUTTON */}
                <Button 
                    onClick={handleUpload}
                    disabled={!file || !selectedVenue || uploading}
                    className="w-full h-14 bg-white text-black font-black text-lg rounded-2xl hover:bg-slate-200 disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="animate-spin mr-2"/> : <Upload className="w-5 h-5 mr-2" />}
                    Post Live
                </Button>
            </div>
        </div>
    </div>
  )
}