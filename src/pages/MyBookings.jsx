import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Ticket, Download, Calendar, Clock, Film, MapPin, Loader2, QrCode } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    api.get('/bookings/my')
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const downloadTicket = async (bookingId) => {
    setDownloading(bookingId);
    try {
      const res = await api.get(`/bookings/download/${bookingId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `FindSeat_${bookingId}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Ticket downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(null); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center">
            <Ticket className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Tickets</h1>
            <p className="text-gray-600 text-sm">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-24">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No bookings yet</h3>
            <p className="text-gray-600 mt-2">Start booking your favourite movies!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="card overflow-hidden animate-fade-in">
                {/* Ticket Design */}
                <div className="flex">
                  {/* Left Stub */}
                  <div className="w-2 bg-brand flex-shrink-0" />

                  {/* Poster */}
                  <div className="w-20 flex-shrink-0">
                    <img
                      src={b.poster_url || 'https://placehold.co/80x120/1a1a1a/666?text=Movie'}
                      alt={b.movie_title}
                      className="w-full h-full object-cover"
                      onError={e => e.target.src = 'https://placehold.co/80x120/1a1a1a/666?text=Movie'}
                    />
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{b.movie_title}</h3>
                        <span className="badge bg-gray-200 text-gray-600 text-xs mt-1">{b.genre}</span>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                      <InfoItem icon={<Calendar size={13}/>} label={b.show_date && new Date(b.show_date).toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})} />
                      <InfoItem icon={<Clock size={13}/>} label={b.show_time?.slice(0,5)} />
                      <InfoItem icon={<MapPin size={13}/>} label={`Screen ${b.screen}`} />
                      <InfoItem icon={<Ticket size={13}/>} label={b.seat_numbers} />
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 font-mono">{b.booking_id}</p>
                        <p className="text-green-400 font-bold text-lg">₹{b.total_amount}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadTicket(b.booking_id)}
                          disabled={downloading === b.booking_id}
                          className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
                        >
                          {downloading === b.booking_id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Download size={14} />}
                          PDF Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 text-gray-600">
    <span className="text-brand">{icon}</span>
    <span>{label}</span>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: 'bg-green-500/20 text-green-400 border border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30'
  };
  return <span className={`badge text-xs ${map[status] || map.confirmed}`}>{status}</span>;
};

