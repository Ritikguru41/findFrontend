import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Ticket, Search, Loader2 } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/bookings/all')
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b =>
    !search ||
    b.booking_id?.toLowerCase().includes(search.toLowerCase()) ||
    b.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.movie_title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((s, b) => s + Number(b.total_amount), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Bookings Management
            </h1>
            <p className="text-gray-600 mt-1">
              {bookings.length} total bookings • ₹{totalRevenue.toLocaleString('en-IN')} revenue
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
          </div>
        ) : (
          <div className="card overflow-hidden border border-gray-200 rounded-xl">

            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                {/* Table Head */}
                <thead className="bg-gray-100">
                  <tr>
                    {['Booking ID', 'Customer', 'Movie', 'Date', 'Seats', 'Amount', 'Status'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-200">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">

                      <td className="px-4 py-3 font-mono text-blue-600 text-xs">
                        {b.booking_id}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{b.user_name}</p>
                        <p className="text-xs text-gray-500">{b.user_email}</p>
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        {b.movie_title}
                      </td>

                      <td className="px-4 py-3 text-gray-700">
                        <p>{new Date(b.show_date).toLocaleDateString('en-IN')}</p>
                        <p className="text-xs text-gray-500">
                          {b.show_time?.slice(0, 5)}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-gray-700 text-xs max-w-[120px] truncate">
                        {b.seat_numbers}
                      </td>

                      <td className="px-4 py-3 text-green-600 font-bold">
                        ₹{b.total_amount}
                      </td>

                      {/* ✅ UPDATED GREY STATUS BADGE */}
                      <td className="px-4 py-3">
                        <span className="inline-block text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300 font-medium capitalize">
                          {b.status}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

              {/* Empty State */}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  {search ? 'No results found' : 'No bookings yet'}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}