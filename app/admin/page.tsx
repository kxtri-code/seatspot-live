import AdminMap from "@/components/AdminMap";

export default function AdminPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4">
      <div className="mb-8 text-center text-white">
        <h1 className="text-4xl font-extrabold tracking-tight">SeatSpot Command Center</h1>
        <p className="text-gray-400 mt-2">Only for Staff</p>
      </div>
      <AdminMap />
    </main>
  );
}