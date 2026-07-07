import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Users, CheckCircle, XCircle, ShieldCheck, Loader2, Search, Trash2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">{users.length} registered users</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Users" value={users.length} color="text-blue-400" />
          <StatCard label="Verified" value={users.filter(u => u.is_verified).length} color="text-green-400" />
          <StatCard label="Admins" value={users.filter(u => u.role === 'admin').length} color="text-brand" />
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4"/>
          <input type="text" placeholder="Search users..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 text-brand animate-spin"/></div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {['User','Email','Role','Verified','Joined', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-100/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-brand">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${u.role === 'admin' ? 'bg-brand/20 text-brand border border-brand/30' : 'bg-gray-200 text-gray-600'}`}>
                          {u.role === 'admin' ? <><ShieldCheck size={10}/> Admin</> : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.is_verified
                          ? <CheckCircle size={18} className="text-green-400" />
                          : <XCircle size={18} className="text-red-400" />}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDelete(u.id, u.name)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded transition-colors" title="Delete User">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="py-12 text-center text-gray-500">{search ? 'No users found' : 'No users yet'}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ label, value, color }) => (
  <div className="card p-4 text-center">
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

