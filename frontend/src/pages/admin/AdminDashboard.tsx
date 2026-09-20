import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface AnalyticsSummary {
  total_screenings: number;
  screenings_by_risk: Record<string, number>;
  referrals: number;
  screenings_per_day: Record<string, number>;
  screenings_by_village: Record<string, number>;
}

const COLORS = {
  High: '#ef4444',
  Moderate: '#f59e0b',
  Low: '#10b981',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/admin/analytics/summary');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  const riskData = Object.entries(data.screenings_by_risk).map(([name, value]) => ({ name, value }));
  const trendData = Object.entries(data.screenings_per_day)
    .map(([date, count]) => ({ date: date.slice(5), count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
        <div className="space-x-4">
          <button onClick={() => navigate('/admin/users')} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition">
            Manage Users
          </button>
          <button onClick={() => navigate('/admin/audit-logs')} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-100 transition border border-slate-200">
            View Audit Logs
          </button>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="bg-rose-50 text-rose-700 px-4 py-2 rounded-lg font-medium hover:bg-rose-100 transition">
            Logout
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500 font-medium uppercase">Total Screenings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.total_screenings}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium uppercase">High Risk</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.screenings_by_risk['High'] || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium uppercase">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.referrals}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Risk Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {riskData.map(entry => (
              <div key={entry.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] || '#9ca3af' }}></div>
                <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Screening Trends */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Screening Activity (Last 30 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
