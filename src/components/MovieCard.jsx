import { Link } from 'react-router-dom';
import { Star, Clock, Globe } from 'lucide-react';

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.id}`} className="card group block hover:-translate-y-1 transition-all duration-300">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
        <img
          src={movie.poster_url || 'https://placehold.co/300x450/1a1a1a/666?text=No+Poster'}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://placehold.co/300x450/1a1a1a/666?text=No+Poster'; }}
        />
        {/* Rating badge */}
        {movie.rating > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">{movie.rating}</span>
          </div>
        )}
        {/* Genre */}
        <div className="absolute bottom-2 left-2">
          <span className="badge bg-brand/80 text-gray-900 text-xs">{movie.genre}</span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-brand font-semibold text-sm">Book Now →</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-brand transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5 text-gray-500">
          {movie.duration && (
            <span className="flex items-center gap-1 text-xs">
              <Clock size={11} />{Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            </span>
          )}
          {movie.language && (
            <span className="flex items-center gap-1 text-xs">
              <Globe size={11} />{movie.language}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

