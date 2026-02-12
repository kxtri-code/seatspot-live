// IMPORTANT: If your SeatMap.tsx is in the 'ui' folder, change this line to:
// import SeatMap from "@/components/ui/SeatMap";
import SeatMap from "@/components/SeatMap"; 

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-600">SeatSpot</h1>
        <p className="text-gray-500 mt-2">Live Booking System</p>
      </div>

      {/* The Map Component */}
      <SeatMap />
    </main>
  );
}