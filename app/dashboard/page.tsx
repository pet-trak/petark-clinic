// /app/dashboard/page.tsx

export default function DashboardPage() {
  return (
    <div className="pry-ff p-4 md:p-10 lg:p-8">
      <h1 className="text-2xl font-bold text-sec-clr mb-6">Dashboard</h1>
      
      {/* Example dashboard content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-pry-clr p-6 shadow-sm">
          <h3 className="font-semibold text-sec-clr">Total Pets</h3>
          <p className="text-2xl font-bold text-acc-clr mt-2">0</p>
        </div>
        <div className="rounded-lg bg-pry-clr p-6 shadow-sm">
          <h3 className="font-semibold text-sec-clr">Upcoming Appointments</h3>
          <p className="text-2xl font-bold text-acc-clr mt-2">0</p>
        </div>
        <div className="rounded-lg bg-pry-clr p-6 shadow-sm">
          <h3 className="font-semibold text-sec-clr">Medical Records</h3>
          <p className="text-2xl font-bold text-acc-clr mt-2">0</p>
        </div>
      </div>
    </div>
  );
}