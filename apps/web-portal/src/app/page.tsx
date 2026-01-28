import Link from 'next/link';
import { Suspense } from 'react';

// Mock Data Fetching (in real app, this calls Cloud API)
async function getStats() {
  // Determine stats from DB
  return {
    totalCitizens: 120,
    totalSessions: 450,
    avgBP: "128/82",
    activeKiosks: 1
  };
}

export default async function Dashboard() {
  const stats = await getStats();

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-slate-800">GINHAWA Web Portal</h1>
        <nav className="space-x-4">
          <Link href="/" className="text-teal-600 font-bold">Dashboard</Link>
          <Link href="/citizens" className="text-slate-600 hover:text-teal-600">Citizens</Link>
        </nav>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Citizens" value={stats.totalCitizens} />
        <StatCard title="Total Check-ups" value={stats.totalSessions} />
        <StatCard title="Avg Community BP" value={stats.avgBP} />
        <StatCard title="Active Kiosks" value={stats.activeKiosks} />
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Health Trends (Mock)</h2>
        <div className="h-64 flex items-end justify-between space-x-2 px-4">
          {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
            <div key={i} className="w-full bg-teal-100 rounded-t-lg relative group">
              <div
                style={{ height: `${h}%` }}
                className="absolute bottom-0 w-full bg-teal-500 rounded-t-lg transition-all group-hover:bg-teal-600"
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-slate-400">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-medium text-slate-500 uppercase">{title}</h3>
      <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
    </div>
  );
}
