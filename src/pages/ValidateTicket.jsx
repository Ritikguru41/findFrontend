import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Loader2, QrCode, Ticket } from 'lucide-react';

export default function ValidateTicket() {
  const { bookingId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/validate/${bookingId}`)
      .then(r => setResult(r.data))
      .catch(err => setResult({ valid: false, message: err.response?.data?.message || 'Validation failed' }))
      .finally(() => setLoading(false));
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="glass max-w-md w-full p-8 text-center animate-scale-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <QrCode className="w-6 h-6 text-brand" />
          <h1 className="text-2xl font-bold"><span className="text-brand">Find</span>Seat Validator</h1>
        </div>

        {loading ? (
          <Loader2 className="w-12 h-12 text-brand animate-spin mx-auto" />
        ) : result?.valid ? (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-black text-green-400 mb-2">✅ Valid Ticket</h2>
            <div className="bg-gray-100 rounded-xl p-4 my-6 text-left space-y-2 text-sm">
              <Row label="Booking ID" value={result.booking?.bookingId} mono />
              <Row label="Movie" value={result.booking?.movieTitle} />
              <Row label="Customer" value={result.booking?.userName} />
              <Row label="Seats" value={result.booking?.seats} />
              <Row label="Date" value={result.booking?.showDate && new Date(result.booking.showDate).toLocaleDateString('en-IN')} />
              <Row label="Time" value={result.booking?.showTime?.slice(0,5)} />
              <Row label="Screen" value={result.booking?.screen} />
              <Row label="Status" value={<span className="text-green-400 font-bold capitalize">{result.booking?.status}</span>} />
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-black text-red-400 mb-2">❌ Invalid Ticket</h2>
            <p className="text-gray-600">{result?.message || 'This ticket could not be validated'}</p>
          </>
        )}

        <div className="mt-6 text-xs text-gray-600 flex items-center justify-center gap-2">
          <Ticket size={12} /> Booking ID: <span className="font-mono text-gray-500">{bookingId}</span>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value, mono }) => (
  <div className="flex justify-between items-start gap-2">
    <span className="text-gray-500 flex-shrink-0">{label}</span>
    <span className={`text-gray-900 text-right ${mono ? 'font-mono text-brand text-xs' : 'font-medium'}`}>{value}</span>
  </div>
);

