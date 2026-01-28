import Link from 'next/link';

async function getCitizens() {
    // Mock Data
    return [
        { id: "1", name: "Juan Dela Cruz", age: 45, barangay: "San Isidro", last_bps: "130/85" },
        { id: "2", name: "Maria Santos", age: 32, barangay: "Poblacion", last_bps: "115/75" },
        { id: "3", name: "Pedro Penduko", age: 67, barangay: "San Jose", last_bps: "145/95" },
        { id: "4", name: "Ana Reyes", age: 28, barangay: "Mabini", last_bps: "110/70" },
    ];
}

export default async function CitizensPage() {
    const citizens = await getCitizens();

    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <header className="flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold text-slate-800">Citizens Directory</h1>
                <nav className="space-x-4">
                    <Link href="/" className="text-slate-600 hover:text-teal-600">Dashboard</Link>
                    <Link href="/citizens" className="text-teal-600 font-bold">Citizens</Link>
                </nav>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Name</th>
                            <th className="p-4 font-semibold text-slate-600">Age</th>
                            <th className="p-4 font-semibold text-slate-600">Barangay</th>
                            <th className="p-4 font-semibold text-slate-600">Last BP Reading</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citizens.map((c) => (
                            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-900">{c.name}</td>
                                <td className="p-4 text-slate-600">{c.age}</td>
                                <td className="p-4 text-slate-600">{c.barangay}</td>
                                <td className="p-4 font-mono text-slate-700">{c.last_bps}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${parseInt(c.last_bps.split('/')[0]) > 140
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                        {parseInt(c.last_bps.split('/')[0]) > 140 ? 'High Risk' : 'Normal'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
