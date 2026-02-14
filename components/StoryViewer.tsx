"use client"

import { useEffect, useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

interface StoryViewerProps {
  stories: any[]
  initialIndex: number
  onClose: () => void
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)

  // Auto-advance logic
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          handleNext()
          return 0
        }
        return old + 1 // speed of progress
      })
    }, 50) // Update every 50ms

    return () => clearInterval(timer)
  }, [currentIndex])

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
    } else {
      onClose() // Close if it's the last story
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setProgress(0)
    }
  }

  const activeStory = stories[currentIndex]

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-in fade-in duration-300">
      
      {/* FULL SCREEN CONTAINER */}
      <div className="relative w-full h-full md:max-w-md md:h-[90vh] md:rounded-3xl overflow-hidden bg-slate-900">
          
          {/* BACKGROUND IMAGE/VIDEO */}
          <div className="absolute inset-0">
              <img 
                src={activeStory.img} 
                className="w-full h-full object-cover animate-in zoom-in-105 duration-[5s]" 
                alt="Story"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
          </div>

          {/* HEADER (Progress + Info) */}
          <div className="absolute top-0 left-0 w-full p-4 z-20 space-y-3">
              
              {/* Progress Bars */}
              <div className="flex gap-1 h-1">
                  {stories.map((_, idx) => (
                      <div key={idx} className="flex-1 bg-white/30 rounded-full overflow-hidden h-full">
                          <div 
                            className="h-full bg-white transition-all ease-linear"
                            style={{ 
                                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                            }} 
                          />
                      </div>
                  ))}
              </div>

              {/* User Info */}
              <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-white/50 p-[2px]">
                          <img src={activeStory.img} className="w-full h-full rounded-full object-cover"/>
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-sm leading-none">{activeStory.name}</h4>
                          <span className="text-white/60 text-xs font-medium">2h ago</span>
                      </div>
                  </div>
                  <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white">
                      <X className="w-5 h-5" />
                  </button>
              </div>
          </div>

          {/* TOUCH ZONES */}
          <div className="absolute inset-0 z-10 flex">
              <div className="w-1/3 h-full" onClick={handlePrev} />
              <div className="w-2/3 h-full" onClick={handleNext} />
          </div>

          {/* FOOTER CTA */}
          <div className="absolute bottom-0 left-0 w-full p-6 z-20 pb-10">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                  <div className="text-white">
                      <p className="text-xs font-bold uppercase text-green-400 mb-1">Live Update</p>
                      <p className="text-sm font-medium">"DJ Snake is on the console! 🔥"</p>
                  </div>
                  <button className="bg-white text-black font-black text-xs px-4 py-3 rounded-xl">
                      Book Now
                  </button>
              </div>
          </div>

      </div>
    </div>
  )
}