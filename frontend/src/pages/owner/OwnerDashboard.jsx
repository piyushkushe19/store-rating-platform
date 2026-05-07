import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ownerAPI } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import StarRating from '../../components/common/StarRating';
import SortableTable from '../../components/common/SortableTable';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ChangePasswordForm from '../../components/common/ChangePasswordForm';

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview() {
  const [data, setData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([ownerAPI.getDashboard(), ownerAPI.getRatings()])
      .then(([dash, rts]) => { setData(dash); setRatings(rts); })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const columns = [
    { key: 'user', label: 'Customer Name', sortable: true, render: r => r.user?.name },
    { key: 'email', label: 'Email', render: r => r.user?.email },
    { key: 'rating', label: 'Rating', sortable: true, render: r => (
      <div className="flex items-center gap-2">
        <StarRating value={r.rating} readonly size="sm" />
        <span className="text-sm font-medium text-gray-700">{r.rating}/5</span>
      </div>
    )},
    { key: 'createdAt', label: 'Date', sortable: true, render: r => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Store Dashboard</h2>

      {/* Store Info */}
      {data?.store && (
        <div className="card mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h3 className="text-lg font-semibold">{data.store.name}</h3>
          <p className="text-blue-100 text-sm mt-1">{data.store.address}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          title="Average Rating"
          value={data?.averageRating ? `${data.averageRating} / 5` : 'No ratings yet'}
          icon="⭐"
          color="yellow"
        />
        <StatCard
          title="Total Ratings"
          value={data?.totalRatings}
          icon="📝"
          color="blue"
        />
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-4">Customer Ratings</h3>
        {ratings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">⭐</div>
            <p>No ratings yet. Customers can rate your store.</p>
          </div>
        ) : (
          <SortableTable
            columns={columns}
            data={ratings.map((r, i) => ({ ...r, id: r.id || i }))}
          />
        )}
      </div>
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
  { to: '/owner', label: 'Dashboard', icon: '📊', end: true },
  { to: '/owner/settings', label: 'Settings', icon: '⚙️' },
];

export default function OwnerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <aside className="w-56 bg-white border-r border-gray-100 min-h-[calc(100vh-57px)] flex-shrink-0">
          <div className="p-3">
            {navLinks.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <span>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="flex-1 p-6 min-w-0">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
