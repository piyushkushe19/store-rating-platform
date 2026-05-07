import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/common/StatCard';
import SortableTable from '../../components/common/SortableTable';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ChangePasswordForm from '../../components/common/ChangePasswordForm';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
const ROLES = ['ADMIN', 'USER', 'STORE_OWNER'];
const roleBadge = { ADMIN: 'bg-purple-100 text-purple-700', USER: 'bg-blue-100 text-blue-700', STORE_OWNER: 'bg-green-100 text-green-700' };

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminAPI.getDashboard().then(setStats).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSpinner />;
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats?.totalUsers} icon="👥" color="blue" />
        <StatCard title="Total Stores" value={stats?.totalStores} icon="🏪" color="green" />
        <StatCard title="Total Ratings" value={stats?.totalRatings} icon="⭐" color="yellow" />
      </div>
    </div>
  );
}

// ── Users ─────────────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'USER' });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.name) params.name = filters.name;
    if (filters.email) params.email = filters.email;
    if (filters.address) params.address = filters.address;
    if (filters.role) params.role = filters.role;
    adminAPI.getUsers(params).then(setUsers).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const validateForm = () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    else if (form.name.length < 20) e.name = 'Min 20 characters';
    else if (form.name.length > 60) e.name = 'Max 60 characters';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.address) e.address = 'Required';
    else if (form.address.length > 400) e.address = 'Max 400 characters';
    if (!form.password) e.password = 'Required';
    else if (form.password.length < 8 || form.password.length > 16) e.password = '8-16 characters';
    else if (!PASSWORD_REGEX.test(form.password)) e.password = 'Need 1 uppercase + 1 special char';
    setFormErrors(e);
    return !Object.keys(e).length;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setCreating(true);
    try {
      await adminAPI.createUser(form);
      toast.success('User created!');
      setShowCreate(false);
      setForm({ name: '', email: '', address: '', password: '', role: 'USER' });
      load();
    } catch (err) { toast.error(err.message); }
    finally { setCreating(false); }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: r => <span className="max-w-xs truncate block">{r.address}</span> },
    { key: 'role', label: 'Role', sortable: true, render: r => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge[r.role]}`}>{r.role}</span>
    )},
    { key: 'actions', label: '', render: r => (
      <button onClick={() => adminAPI.getUserById(r.id).then(setViewUser).catch(e => toast.error(e.message))}
        className="text-blue-600 hover:underline text-xs font-medium">View</button>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">+ Add User</button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { key: 'name', ph: 'Filter by name' },
          { key: 'email', ph: 'Filter by email' },
          { key: 'address', ph: 'Filter by address' },
        ].map(({ key, ph }) => (
          <input key={key} className="input-field text-sm" placeholder={ph}
            value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} />
        ))}
        <select className="input-field text-sm" value={filters.role}
          onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : <SortableTable columns={columns} data={users} emptyMessage="No users found" />}

      {/* Create User Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New User">
        <form onSubmit={handleCreate} className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text', hint: '20-60 chars' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'address', label: 'Address', type: 'text', hint: 'max 400 chars' },
            { key: 'password', label: 'Password', type: 'password', hint: '8-16 chars, 1 upper, 1 special' },
          ].map(({ key, label, type, hint }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}{hint && <span className="text-xs text-gray-400 ml-1">({hint})</span>}
              </label>
              <input type={type} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className={`input-field ${formErrors[key] ? 'border-red-400' : ''}`} />
              {formErrors[key] && <p className="text-red-500 text-xs mt-1">{formErrors[key]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-field">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={creating} className="btn-primary flex-1">
              {creating ? 'Creating...' : 'Create User'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* View User Modal */}
      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details">
        {viewUser && (
          <div className="space-y-3">
            {[['Name', viewUser.name], ['Email', viewUser.email], ['Address', viewUser.address], ['Role', viewUser.role], ['Joined', new Date(viewUser.createdAt).toLocaleDateString()]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className={`text-sm font-medium ${k === 'Role' ? `px-2 rounded-full text-xs ${roleBadge[v]}` : 'text-gray-800'}`}>{v}</span>
              </div>
            ))}
            {viewUser.role === 'STORE_OWNER' && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Store Rating</span>
                <span className="text-sm font-medium text-yellow-600">{viewUser.storeRating ? `${viewUser.storeRating} ★` : 'No ratings yet'}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Stores ────────────────────────────────────────────────────────────────────
function StoresPanel() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [owners, setOwners] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.name) params.name = filters.name;
    if (filters.email) params.email = filters.email;
    if (filters.address) params.address = filters.address;
    adminAPI.getStores(params).then(setStores).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    adminAPI.getAvailableOwners().then(setOwners).catch(() => {});
    setShowCreate(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.address) e.address = 'Required';
    if (!form.ownerId) e.ownerId = 'Select an owner';
    setFormErrors(e);
    return !Object.keys(e).length;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setCreating(true);
    try {
      await adminAPI.createStore(form);
      toast.success('Store created!');
      setShowCreate(false);
      setForm({ name: '', email: '', address: '', ownerId: '' });
      load();
    } catch (err) { toast.error(err.message); }
    finally { setCreating(false); }
  };

  const columns = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true, render: r => <span className="max-w-xs truncate block">{r.address}</span> },
    { key: 'averageRating', label: 'Rating', sortable: true, render: r => (
      <span className="text-yellow-600 font-medium">{r.averageRating ? `${r.averageRating} ★` : '—'}</span>
    )},
    { key: 'owner', label: 'Owner', render: r => r.owner?.name || '—' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Stores</h2>
        <button onClick={openCreate} className="btn-primary text-sm">+ Add Store</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {[['name', 'Filter by name'], ['email', 'Filter by email'], ['address', 'Filter by address']].map(([k, ph]) => (
          <input key={k} className="input-field text-sm" placeholder={ph}
            value={filters[k]} onChange={e => setFilters(f => ({ ...f, [k]: e.target.value }))} />
        ))}
      </div>

      {loading ? <LoadingSpinner /> : <SortableTable columns={columns} data={stores} emptyMessage="No stores found" />}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Store">
        <form onSubmit={handleCreate} className="space-y-4">
          {[['name', 'Store Name', 'text'], ['email', 'Store Email', 'email'], ['address', 'Address', 'text']].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className={`input-field ${formErrors[key] ? 'border-red-400' : ''}`} />
              {formErrors[key] && <p className="text-red-500 text-xs mt-1">{formErrors[key]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Owner</label>
            <select value={form.ownerId} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
              className={`input-field ${formErrors.ownerId ? 'border-red-400' : ''}`}>
              <option value="">Select owner...</option>
              {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
            </select>
            {formErrors.ownerId && <p className="text-red-500 text-xs mt-1">{formErrors.ownerId}</p>}
            {owners.length === 0 && <p className="text-amber-600 text-xs mt-1">No available store owners. Create a STORE_OWNER user first.</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={creating} className="btn-primary flex-1">{creating ? 'Creating...' : 'Create Store'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function Settings() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>
      <div className="card max-w-md">
        <h3 className="font-medium text-gray-700 mb-4">Change Password</h3>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
const navLinks = [
  { to: '/admin', label: 'Overview', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/stores', label: 'Stores', icon: '🏪' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} transition-all duration-200 bg-white border-r border-gray-100 min-h-[calc(100vh-57px)] flex-shrink-0`}>
          <div className="p-3">
            <button onClick={() => setSidebarOpen(o => !o)} className="w-full text-left p-2 text-gray-400 hover:text-gray-600 text-sm mb-2">
              {sidebarOpen ? '◀ Collapse' : '▶'}
            </button>
            {navLinks.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <span>{icon}</span>
                {sidebarOpen && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-6 min-w-0">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="users" element={<UsersPanel />} />
            <Route path="stores" element={<StoresPanel />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
