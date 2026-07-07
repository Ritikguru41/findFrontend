import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Armchair, CreditCard, X, CheckCircle, Loader2, Info } from 'lucide-react';

export default function BookingPage() {
  const { showId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('select'); // select | confirm | success
  const [bookingResult, setBookingResult] = useState(null);
  const [paying, setPaying] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [showRes, seatRes] = await Promise.all([
        api.get(`/shows/${showId}`),
        api.get(`/seats/show/${showId}`)
      ]);
      setShow(showRes.data);
      setSeats(seatRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load show details';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-release expired locks
  useEffect(() => {
    const interval = setInterval(() => {
      setSeats(prev => prev.map(s =>
        s.status === 'locked' && s.lock_expires && new Date(s.lock_expires) < new Date()
          ? { ...s, status: 'available', locked_by: null }
          : s
      ));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleSeat = (seat) => {
    if (seat.status === 'booked') return;
    if (seat.status === 'locked' && seat.locked_by !== user?.id) return;
    setSelected(prev =>
      prev.includes(seat.id) ? prev.filter(id => id !== seat.id) : [...prev, seat.id]
    );
  };

  const getSeatClass = (seat) => {
    if (seat.status === 'booked') return 'seat-booked';
    if (seat.status === 'locked' && seat.locked_by !== user?.id) return 'seat-locked';
    if (selected.includes(seat.id)) return 'seat-selected';
    if (seat.type === 'premium') return 'seat-premium';
    return 'seat-available';
  };

  const completeBooking = async (paymentId) => {
    const { data: booking } = await api.post('/bookings', {
      showId, seatIds: selected, paymentId, totalAmount: totalPrice
    });
    setBookingResult(booking.booking);
    setStep('success');
    toast.success('Booking confirmed! 🎉');
    setPaying(false);
  };

  const handleProceedToPayment = async () => {
    if (selected.length === 0) return toast.error('Please select at least one seat');
    setPaying(true);
    try {
      await api.post('/seats/lock', { showId, seatIds: selected });
      const { data: order } = await api.post('/payments/create-order', { amount: totalPrice });

      if (!window.Razorpay || order.isDemo) {
        toast.success('Simulating payment (Razorpay keys not configured)');
        const { data: verifyData } = await api.post('/payments/verify', {
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'demo_signature',
          isDemo: true
        });

        if (verifyData.success) {
          return await completeBooking(verifyData.paymentId);
        } else {
          throw new Error('Demo Payment Verification failed');
        }
      }

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'FindSeat',
        description: `Booking for ${show.movie_title}`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            const { data: verifyData } = await api.post('/payments/verify', response);
            if (verifyData.success) {
              await completeBooking(verifyData.paymentId);
            }
          } catch (err) {
            toast.error('Payment verification failed');
            await api.post('/seats/release', { seatIds: selected });
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: '#e50914' },
        modal: {
          ondismiss: async () => {
            await api.post('/seats/release', { seatIds: selected }).catch(() => {});
            toast('Payment cancelled');
            setPaying(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to proceed. Please try again.';
      toast.error(errMsg);
      console.error('Payment flow error:', err.response?.data || err.message);
      await api.post('/seats/release', { seatIds: selected }).catch(() => {});
      setPaying(false);
    }
  };

  const downloadTicket = async () => {
    if (!bookingResult) return;
    try {
      const res = await api.get(`/bookings/download/${bookingResult.bookingId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `FindSeat_${bookingResult.bookingId}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
    </div>
  );

  // Show not found or failed to load
  if (!show) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-5xl">🎬</div>
      <h2 className="text-xl font-bold text-gray-800">Show Not Found</h2>
      <p className="text-gray-500 text-sm">This show may have been removed or the link is invalid.</p>
      <button onClick={() => navigate(-1)} className="btn-primary mt-2">Go Back</button>
    </div>
  );

  // Group seats by row
  const rowMap = {};
  seats.forEach(s => {
    if (!rowMap[s.row_label]) rowMap[s.row_label] = [];
    rowMap[s.row_label].push(s);
  });
  const rows = Object.keys(rowMap).sort();
  const selectedSeats = seats.filter(s => selected.includes(s.id));
  const totalPrice = selectedSeats.reduce((acc, seat) => {
    const base = Number(show?.price || 200);
    return acc + (seat.type === 'premium' ? base + 100 : base);
  }, 0);

  if (step === 'success' && bookingResult) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="glass p-10 max-w-md w-full text-center animate-scale-in">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Booking Confirmed! 🎉</h2>
        <div className="bg-gray-100 rounded-xl p-4 my-6 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Booking ID</span><span className="text-brand font-mono font-bold">{bookingResult.bookingId}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Movie</span><span className="text-gray-900">{bookingResult.movieTitle}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Seats</span><span className="text-gray-900">{bookingResult.seatNumbers}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Date</span><span className="text-gray-900">{new Date(bookingResult.showDate).toLocaleDateString('en-IN')}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Amount</span><span className="text-green-400 font-bold">₹{bookingResult.totalAmount}</span></div>
        </div>
        <p className="text-gray-500 text-sm mb-6">A confirmation email with your ticket has been sent.</p>
        <div className="flex gap-3">
          <button onClick={downloadTicket} className="btn-primary flex-1 flex items-center justify-center gap-2">
            📄 Download Ticket
          </button>
          <button onClick={() => navigate('/my-bookings')} className="btn-secondary flex-1">
            My Bookings
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 transition-colors"><X size={20}/></button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{show?.movie_title}</h1>
            <p className="text-sm text-gray-600">
              {show?.show_date && new Date(show.show_date).toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long'})} • {show?.show_time?.slice(0,5)} • Screen {show?.screen}
            </p>
          </div>
        </div>

        {/* Screen */}
        <div className="text-center mb-8">
          <div className="inline-block w-2/3 h-2 bg-gradient-to-r from-transparent via-brand to-transparent rounded-full mb-1 opacity-70" />
          <p className="text-xs text-gray-500 tracking-widest uppercase">Screen</p>
        </div>

        {/* Seat Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="inline-block min-w-full">
            {rows.map(row => (
              <div key={row} className="flex items-center gap-2 mb-2 justify-center">
                <span className="w-5 text-xs text-gray-500 font-mono text-center">{row}</span>
                <div className="flex gap-1.5">
                  {rowMap[row].map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      className={`w-8 h-8 flex items-center justify-center ${getSeatClass(seat)}`}
                      title={`${seat.seat_number} - ${seat.status}`}
                      disabled={seat.status === 'booked' || (seat.status === 'locked' && seat.locked_by !== user?.id)}
                    >
                      {seat.seat_num}
                    </button>
                  ))}
                </div>
                <span className="w-5 text-xs text-gray-500 font-mono text-center">{row}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 mb-8 text-xs text-gray-600">
          <LegendItem color="bg-green-100 border border-green-400" label="Normal" />
          <LegendItem color="bg-purple-100 border border-purple-400" label="Premium" />
          <LegendItem color="bg-blue-600 border border-blue-700" label="Selected" />
          <LegendItem color="bg-red-500 border border-red-600 opacity-80" label="Booked" />
          <LegendItem color="bg-yellow-100 border border-yellow-300" label="Locked" />
        </div>

        {/* Summary */}
        {selected.length > 0 && (
          <div className="glass p-5 animate-slide-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Armchair size={16} className="text-brand" />
                  <span className="text-gray-900 font-semibold">
                    {selected.length} seat{selected.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedSeats.map(s => s.seat_number).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gray-900">₹{totalPrice}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  {selectedSeats.some(s => s.type !== 'premium') && (
                    <p>Normal: ₹{show?.price} × {selectedSeats.filter(s => s.type !== 'premium').length}</p>
                  )}
                  {selectedSeats.some(s => s.type === 'premium') && (
                    <p>Premium: ₹{Number(show?.price || 200) + 100} × {selectedSeats.filter(s => s.type === 'premium').length}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleProceedToPayment}
                disabled={paying}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                {paying ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                Pay & Confirm
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-200 pt-3">
              <Info size={12} />
              <span>Seats are locked for 5 minutes during payment. Check your email for the ticket PDF after booking.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-5 h-5 rounded ${color}`} />
    <span>{label}</span>
  </div>
);

