import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Film, Loader2, Star, Clock } from 'lucide-react';

const EMPTY = { title: '', description: '', genre: '', duration: '', language: 'Hindi', rating: '', poster_url: '', trailer_url: '', release_date: '' };

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMovies = () => {
    setLoading(true);
    api.get('/movies').then(r => setMovies(r.data)).catch(() => toast.error('Failed to load movies')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMovies(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (m) => { setForm({ ...m, release_date: m.release_date?.slice(0, 10) || '' }); setEditing(m.id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await api.put(`/movies/${editing}`, form); toast.success('Movie updated!'); }
      else { await api.post('/movies', form); toast.success('Movie added!'); }
      setModal(false); fetchMovies();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await api.delete(`/movies/${id}`); toast.success('Deleted!'); fetchMovies(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Movie Management</h1>
            <p className="text-gray-600 mt-1">{movies.length} movies in database</p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Movie
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 text-brand animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map(m => (
              <div key={m.id} className="card group relative">
                <div className="aspect-[2/3] overflow-hidden bg-gray-100">
                  <img src={m.poster_url || 'https://placehold.co/200x300/1a1a1a/666?text=No+Poster'}
                    alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => e.target.src = 'https://placehold.co/200x300/1a1a1a/666?text=No+Poster'} />
                  {/* Overlay Buttons */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(m)} className="bg-blue-600 hover:bg-blue-700 text-gray-900 p-2 rounded-lg transition-colors"><Pencil size={16}/></button>
                    <button onClick={() => handleDelete(m.id, m.title)} className="bg-red-600 hover:bg-red-700 text-gray-900 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{m.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{m.genre}</span>
                    {m.rating > 0 && <span className="flex items-center gap-0.5 text-xs text-yellow-400"><Star size={10} fill="currentColor"/>{m.rating}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="glass w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Film size={20} className="text-brand"/>{editing ? 'Edit Movie' : 'Add Movie'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-600 hover:text-gray-900"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { label: 'Title', key: 'title', required: true },
                { label: 'Genre', key: 'genre' },
                { label: 'Language', key: 'language' },
                { label: 'Duration (minutes)', key: 'duration', type: 'number' },
                { label: 'Rating (0-10)', key: 'rating', type: 'number', step: '0.1', min: 0, max: 10 },
                { label: 'Poster URL', key: 'poster_url' },
                { label: 'Trailer YouTube URL', key: 'trailer_url' },
                { label: 'Release Date', key: 'release_date', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-600 mb-1">{f.label}{f.required && <span className="text-brand ml-1">*</span>}</label>
                  <input type={f.type || 'text'} step={f.step} min={f.min} max={f.max}
                    value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required} className="input-field" />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} className="input-field resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin"/> : null}{editing ? 'Update' : 'Add Movie'}
                </button>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

