import { useState, useEffect } from 'react';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import { Search, Filter, Film, Loader2 } from 'lucide-react';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    api.get('/movies/genres').then(r => setGenres(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (selectedGenre) params.genre = selectedGenre;
    api.get('/movies', { params })
      .then(r => setMovies(r.data))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [search, selectedGenre]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-white via-gray-50 to-gray-50 border-b border-gray-200">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-brand mb-3">
              <Film size={20} />
              <span className="text-sm font-medium tracking-wider uppercase">Now Showing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
              Book Your <span className="text-brand">Perfect Seat</span>
            </h1>
            <p className="text-gray-600 text-lg">Premium cinema experience with exclusive seat selection</p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search movies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-12 h-12 text-base"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <select
                value={selectedGenre}
                onChange={e => setSelectedGenre(e.target.value)}
                className="input-field pl-10 h-12 pr-8 appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="">All Genres</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Genre Chips */}
      {genres.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedGenre('')}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedGenre === '' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}
          >All</button>
          {genres.map(g => (
            <button key={g}
              onClick={() => setSelectedGenre(g === selectedGenre ? '' : g)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedGenre === g ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}
            >{g}</button>
          ))}
        </div>
      )}

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24">
            <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 text-xl font-semibold">No movies found</h3>
            <p className="text-gray-600 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedGenre || search ? 'Search Results' : 'All Movies'}
                <span className="ml-2 text-base font-normal text-gray-500">({movies.length} movies)</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

