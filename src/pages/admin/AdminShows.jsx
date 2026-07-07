import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Calendar, Loader2 } from 'lucide-react';

const EMPTY = { movie_id: '', cinema_id: '', show_date: '', show_time: '', screen: '1', total_seats: 64, price: 200 };

export default function AdminShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, m, c] = await Promise.all([api.get('/shows'), api.get('/movies'), api.get('/cinemas')]);
      setShows(s.data); setMovies(m.data); setCinemas(c.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/shows', form);
      toast.success('Show created with seats!');
      setModal(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this show and all its seats?')) return;
    try { await api.delete(`/shows/${id}`); toast.success('Show deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Show Management</h1>
            <p className="text-gray-600 mt-1">{shows.length} shows scheduled</p>
          </div>
          <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> Add Show
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 text-brand animate-spin"/></div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {['Movie','Date','Time','Screen','Seats','Available','Price','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shows.map(s => (
                    <tr key={s.id} className="hover:bg-gray-100/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {s.movie_title}
                        <div className="text-xs text-gray-500 font-normal">{s.cinema_name}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{new Date(s.show_date).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-gray-700">{s.show_time?.slice(0,5)}</td>
                      <td className="px-4 py-3 text-gray-700">Screen {s.screen}</td>
                      <td className="px-4 py-3 text-gray-700">{s.total_seats}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${s.available_seats > 10 ? 'bg-green-900/30 text-green-400' : s.available_seats > 0 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                          {s.available_seats}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand font-bold">₹{s.price}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shows.length === 0 && <div className="py-12 text-center text-gray-500">No shows yet. Add one!</div>}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="glass w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Calendar size={20} className="text-brand"/> Add Show</h2>
              <button onClick={() => setModal(false)} className="text-gray-600 hover:text-gray-900"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Movie <span className="text-brand">*</span></label>
                <select value={form.movie_id} onChange={e => setForm({...form, movie_id: e.target.value})} required className="input-field">
                  <option value="">Select Movie</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cinema Hall <span className="text-brand">*</span></label>
                <select value={form.cinema_id} onChange={e => setForm({...form, cinema_id: e.target.value})} required className="input-field">
                  <option value="">Select Cinema</option>
                  {cinemas.map(c => <option key={c.id} value={c.id}>{c.name} ({c.location})</option>)}
                </select>
              </div>
              {[
                { label: 'Date', key: 'show_date', type: 'date', required: true },
                { label: 'Time', key: 'show_time', type: 'time', required: true },
                { label: 'Screen', key: 'screen' },
                { label: 'Total Seats', key: 'total_seats', type: 'number', min: 8, max: 200 },
                { label: 'Price (₹)', key: 'price', type: 'number', min: 50 },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-600 mb-1">{f.label}{f.required && <span className="text-brand ml-1">*</span>}</label>
                  <input type={f.type || 'text'} min={f.min} max={f.max}
                    value={form[f.key] || ''} onChange={e => setForm({...form, [f.key]: e.target.value})}
                    required={f.required} className="input-field" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin"/> : null} Create Show
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

