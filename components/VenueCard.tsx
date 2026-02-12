"use client"

import { Star, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function VenueCard({ venue }: { venue: any }) {
  return (
    <Link href={`/venues/${venue.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all cursor-pointer h-full flex flex-col">
        {/* Venue Image */}
        <div className="h-44 overflow-hidden relative">
          <img 
            src={venue.image_url} 
            alt={venue.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          />
          {venue.is_featured && (
            <Badge className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 border-none font-bold shadow-lg">
              FEATURED
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Venue Text */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                {venue.name}
              </h4>
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg text-xs font-black text-slate-700">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {venue.rating}
              </div>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-auto">
            <MapPin className="w-3 h-3 text-blue-400" /> {venue.location}
          </p>
        </div>
      </div>
    </Link>
  )
}