import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, Film, Ticket, TrendingUp, DollarSign, Loader2, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users />, color: 'from-blue-600/20 to-blue-800/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: <Ticket />, color: 'from-brand/20 to-brand-dark/10', border: 'border-brand/30', text: 'text-brand' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: <DollarSign />, color: 'from-green-600/20 to-green-800/10', border: 'border-green-500/30', text: 'text-green-400' },
    { label: 'Active Movies', value: stats?.totalMovies || 0, icon: <Film />, color: 'from-purple-600/20 to-purple-800/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    { label: 'Upcoming Shows', value: stats?.totalShows || 0, icon: <Calendar />, color: 'from-yellow-600/20 to-yellow-800/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of FindSeat platform</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.color} border ${s.border} rounded-xl p-5 animate-fade-in`}>
              <div className={`${s.text} mb-3`}>{s.icon}</div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Movies by Revenue */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-brand" /> Top Movies by Revenue
            </h2>
            <div className="space-y-3">
              {(stats?.revenueByMovie || []).map((m, i) => {
                const maxRev = stats.revenueByMovie[0]?.revenue || 1;
                const pct = Math.round((m.revenue / maxRev) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 truncate max-w-[60%]">{m.title}</span>
                      <div className="text-right">
                        <span className="text-green-400 font-bold text-sm">₹{Number(m.revenue).toLocaleString('en-IN')}</span>
                        <span className="text-gray-500 text-xs ml-2">({m.bookings} bkgs)</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand to-brand-light rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {(!stats?.revenueByMovie || stats.revenueByMovie.length === 0) && (
                <p className="text-gray-500 text-sm">No data yet</p>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ticket size={18} className="text-brand" /> Recent Bookings
            </h2>
            <div className="space-y-3 overflow-y-auto max-h-64">
              {(stats?.recentBookings || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.user_name}</p>
                    <p className="text-xs text-gray-500">{b.movie_title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">₹{b.total_amount}</p>
                    <p className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              ))}
              {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                <p className="text-gray-500 text-sm">No bookings yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

