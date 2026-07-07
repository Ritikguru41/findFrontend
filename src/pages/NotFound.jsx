import { Link, useNavigate } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand/5 rounded-full blur-3xl" />
      </div>

      <div className="text-center animate-slide-up max-w-md w-full relative">
        {/* Icon */}
        <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Film className="w-12 h-12 text-brand" />
        </div>

        {/* Error code */}
        <p className="text-8xl font-black text-gray-200 mb-2 select-none">404</p>

        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">
          Oops! The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <Home size={18} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
