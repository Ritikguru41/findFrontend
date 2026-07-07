import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, MapPin, Loader2 } from 'lucide-react';

const EMPTY = { name: '', location: '', address: '', total_screens: 1 };

export default function AdminCinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cinemas');
      setCinemas(res.data);
    } catch { toast.error('Failed to load cinemas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCinemas(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/cinemas', form);
      toast.success('Cinema added successfully!');
      setModal(false); fetchCinemas();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add cinema'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cinema? This will delete all its shows and bookings!')) return;
    try { await api.delete(`/cinemas/${id}`); toast.success('Cinema deleted'); fetchCinemas(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Cinema Management</h1>
            <p className="text-gray-600 mt-1">{cinemas.length} registered cinemas</p>
          </div>
          <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> Add Cinema
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
                    {['Name','Location','Address','Screens','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cinemas.map(c => (
                    <tr key={c.id} className="hover:bg-gray-100/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 text-gray-700">{c.location}</td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{c.address}</td>
                      <td className="px-4 py-3 text-gray-700">{c.total_screens}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                          <Trash2 size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cinemas.length === 0 && <div className="py-12 text-center text-gray-500">No cinemas yet. Add one!</div>}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="glass w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><MapPin size={20} className="text-brand"/> Add Cinema</h2>
              <button onClick={() => setModal(false)} className="text-gray-600 hover:text-gray-900"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { label: 'Cinema Name', key: 'name', placeholder: 'e.g. PVR Cinemas' },
                { label: 'Location (City/Area)', key: 'location', placeholder: 'e.g. Mumbai' },
                { label: 'Full Address', key: 'address', placeholder: 'Full address...' },
                { label: 'Total Screens', key: 'total_screens', type: 'number', min: 1, max: 20 },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-600 mb-1">{f.label} <span className="text-brand">*</span></label>
                  <input type={f.type || 'text'} min={f.min} max={f.max} placeholder={f.placeholder}
                    value={form[f.key] || ''} onChange={e => setForm({...form, [f.key]: e.target.value})}
                    required className="input-field" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin"/> : null} Save Cinema
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
