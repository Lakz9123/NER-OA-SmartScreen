import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

interface AnalyticsSummary {
  total_screenings: number;
  screenings_by_risk: Record<string, number>;
  referrals: number;
  pending_followups: number;
  screenings_per_day: Record<string, number>;
  screenings_by_village: Record<string, number>;
}

const COLORS = {
  High: '#ef4444',
  Moderate: '#f59e0b',
  Low: '#10b981',
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, logsRes] = await Promise.all([
          api.get('/admin/analytics/summary'),
          api.get('/admin/audit-logs')
        ]);
        setData(summaryRes.data);
        setRecentActivity(logsRes.data.items.slice(0, 5));
      } catch (err: any) {
        console.error('Failed to load dashboard data', err);
        setError(t('failed_load_dashboard', 'Failed to load dashboard data. Please try again.'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">{t('loading_dashboard', 'Loading dashboard...')}</div>;
  }
  
  if (error || !data) {
    return <div className="p-8 text-center text-red-500">{error || t('failed_load_data', 'Failed to load data.')}</div>;
  }

  const riskData = Object.entries(data.screenings_by_risk).map(([name, value]) => ({ name, value }));
  const trendData = Object.entries(data.screenings_per_day)
    .map(([date, count]) => ({ date: date.slice(5), count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const villageData = Object.entries(data.screenings_by_village)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('system_analytics', 'System Analytics')}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
          <p className="text-sm text-gray-500 font-medium uppercase">{t('total_screenings', 'Total Screenings')}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.total_screenings}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium uppercase">{t('high_risk', 'High Risk')}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.screenings_by_risk['High'] || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium uppercase">{t('total_referrals', 'Total Referrals')}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.referrals}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-amber-500">
          <p className="text-sm text-gray-500 font-medium uppercase">{t('pending_followups', 'Pending Follow-ups')}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{data.pending_followups}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Distribution */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('risk_distribution', 'Risk Distribution')}</h2>
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
                <span className="text-sm text-gray-600">{t(entry.name.toLowerCase(), entry.name)}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Screening Trends */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('screening_activity', 'Screening Activity (Last 30 Days)')}</h2>
          <div className="h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">{t('no_activity_30_days', 'No activity in the last 30 days')}</div>
            )}
          </div>
        </div>

        {/* Screenings By Village */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('screenings_by_village', 'Screenings by Village')}</h2>
          <div className="h-64">
            {villageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={villageData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">{t('no_village_data', 'No village data available')}</div>
            )}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('recent_activity', 'Recent Activity')}</h2>
          <div className="overflow-x-auto">
            {recentActivity.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('action_label', 'Action')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('entity_label', 'Entity')}</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('time_label', 'Time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivity.map(log => (
                    <tr key={log.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{log.action}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0,8)}...)` : ''}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-400 text-center py-4">{t('no_recent_activity', 'No recent activity')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
