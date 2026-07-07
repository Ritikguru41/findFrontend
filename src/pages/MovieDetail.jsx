import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Clock, Globe, Star, Calendar, ChevronRight, Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/movies/${id}`),
      api.get(`/shows/movie/${id}`)
    ]).then(([m, s]) => {
      setMovie(m.data);
      setShows(s.data);
      if (s.data.length > 0) setSelectedDate(s.data[0].show_date?.slice(0, 10));
    }).catch(() => toast.error('Failed to load movie'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Movie not found</p>
    </div>
  );

  // Group shows by date
  const dateMap = {};
  shows.forEach(s => {
    const d = s.show_date?.slice(0, 10);
    if (!dateMap[d]) dateMap[d] = [];
    dateMap[d].push(s);
  });
  const dates = Object.keys(dateMap).sort();
  const filteredShows = selectedDate ? (dateMap[selectedDate] || []) : [];

  const cinemaMap = {};
  filteredShows.forEach(show => {
    const cName = show.cinema_name || 'FindSeat Cinemas';
    const cLoc = show.cinema_location || 'Unknown Location';
    const key = `${cName}|${cLoc}`;
    if (!cinemaMap[key]) cinemaMap[key] = { name: cName, location: cLoc, shows: [] };
    cinemaMap[key].shows.push(show);
  });
  const cinemas = Object.values(cinemaMap);

  const getTrailerEmbedId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };
  const trailerId = getTrailerEmbedId(movie.trailer_url);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[320px] overflow-hidden">
        <img
          src={movie.poster_url || 'https://placehold.co/1920x800/0f0f0f/333?text=FindSeat'}
          alt={movie.title}
          className="w-full h-full object-cover object-top blur-sm scale-105 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <div className="flex items-end gap-6">
            <img
              src={movie.poster_url || 'https://placehold.co/200x300/1a1a1a/666?text=No+Poster'}
              alt={movie.title}
              className="w-28 md:w-40 rounded-xl shadow-2xl border-2 border-gray-200 flex-shrink-0"
              onError={e => e.target.src = 'https://placehold.co/200x300/1a1a1a/666?text=No+Poster'}
            />
            <div className="flex-1 pb-1">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {movie.genre && <span className="badge bg-brand/20 text-brand border border-brand/30">{movie.genre}</span>}
                {movie.rating > 0 && <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" />{movie.rating}/10</span>}
                {movie.duration && <span className="flex items-center gap-1"><Clock size={14}/>{Math.floor(movie.duration/60)}h {movie.duration%60}m</span>}
                {movie.language && <span className="flex items-center gap-1"><Globe size={14}/>{movie.language}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About the Movie</h2>
            <p className="text-gray-600 leading-relaxed">{movie.description || 'No description available.'}</p>
          </div>

          {/* Trailer */}
          {trailerId && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Play size={18} className="text-brand"/> Official Trailer</h2>
              {showTrailer ? (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
                    title="Trailer"
                    allowFullScreen
                    className="w-full h-full"
                    allow="autoplay"
                  />
                </div>
              ) : (
                <div
                  className="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer group relative"
                  onClick={() => setShowTrailer(true)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${trailerId}/maxresdefault.jpg`}
                    alt="Trailer thumbnail"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="relative z-10 w-16 h-16 bg-brand rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play size={28} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Book Tickets */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Book Tickets</h2>

            {dates.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No shows available currently</p>
            ) : (
              <>
                {/* Date Selector */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-1"><Calendar size={14}/> Select Date</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {dates.map(d => {
                      const dt = new Date(d);
                      return (
                        <button key={d} onClick={() => setSelectedDate(d)}
                          className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg text-xs transition-all border ${selectedDate === d ? 'bg-brand border-brand text-gray-900' : 'border-gray-300 text-gray-600 hover:border-brand/50'}`}>
                          <span className="font-bold text-sm">{dt.getDate()}</span>
                          <span>{dt.toLocaleDateString('en',{month:'short'})}</span>
                          <span>{dt.toLocaleDateString('en',{weekday:'short'})}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cinemas and Show Times */}
                <div>
                  <p className="text-sm text-gray-600 mb-3 border-b pb-2">Available Cinemas</p>
                  <div className="space-y-4">
                    {cinemas.map((cinema, idx) => (
                      <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-brand/30 transition-all">
                        <div className="mb-3">
                          <h3 className="text-gray-900 font-bold text-sm">{cinema.name}</h3>
                          <p className="text-xs text-gray-500">{cinema.location}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {cinema.shows.map(show => (
                            <button key={show.id}
                              onClick={() => navigate(`/book/${show.id}`)}
                              className="px-4 py-2 border border-gray-300 hover:border-brand hover:text-brand text-gray-700 rounded-md transition-colors flex flex-col items-center">
                              <span className="text-sm font-semibold">{show.show_time?.slice(0,5)}</span>
                              <span className="text-[10px] uppercase tracking-wider text-gray-400">Screen {show.screen}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Movie Info */}
          <div className="card p-5 space-y-3 text-sm">
            {movie.release_date && <InfoRow label="Release Date" value={new Date(movie.release_date).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})} />}
            {movie.language && <InfoRow label="Language" value={movie.language} />}
            {movie.duration && <InfoRow label="Duration" value={`${Math.floor(movie.duration/60)}h ${movie.duration%60}m`} />}
            {movie.genre && <InfoRow label="Genre" value={movie.genre} />}
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900 font-medium">{value}</span>
  </div>
);

