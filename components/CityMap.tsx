"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Button } from '@/components/ui/button' // Fixed Import Path

// Fix for missing marker icons in Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Custom "Fire" Icon for Hot Events
const fireIcon = L.divIcon({
  html: '<div style="font-size: 24px;">🔥</div>',
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
})

// Define the Event type here so TypeScript is happy
type Event = {
  id: string
  title: string
  venue_name: string
  lat: number
  lng: number
  vibe_score: number
  // Add other fields if needed, but these are required for the map
}

export default function CityMap({ events, onBook }: { events: any[], onBook: (e: any) => void }) {
  // Default Center (San Francisco) - Change to your city!
  const center = [37.7749, -122.4194] as [number, number]

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg relative z-0">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        {/* The Map Tiles (The visual map) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event: Event) => (
          <Marker 
            key={event.id} 
            position={[event.lat, event.lng]} 
            icon={event.vibe_score > 80 ? fireIcon : icon}
          >
            <Popup>
              <div className="text-center min-w-[150px]">
                <h3 className="font-bold text-lg">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{event.venue_name}</p>
                
                {/* VIBE METER */}
                <div className="flex items-center gap-1 justify-center mb-3">
                    <span className="text-xs font-bold uppercase">Vibe:</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${event.vibe_score > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{ width: `${event.vibe_score}%` }}
                        />
                    </div>
                </div>

                <Button size="sm" onClick={() => onBook(event)} className="w-full bg-black text-white">
                    Book Now
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Floating Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md text-xs z-[400] border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
            <span>🔥</span> <span>Hot (80+ Vibe)</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div> <span>Chill</span>
        </div>
      </div>
    </div>
  )
}