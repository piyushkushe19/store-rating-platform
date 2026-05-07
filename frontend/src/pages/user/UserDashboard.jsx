import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { storesAPI, ratingsAPI } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import StarRating from '../../components/common/StarRating';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ChangePasswordForm from '../../components/common/ChangePasswordForm';

// ── Store Card ────────────────────────────────────────────────────────────────
function StoreCard({ store, onRate }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{store.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5 truncate">{store.address}</p>
        </div>
        <div className="ml-3 flex-shrink-0 text-right">
          <div className="text-yellow-500 text-sm font-semibold">
            {store.averageRating ? `${store.averageRating} ★` : 'No ratings'}
          </div>
          <div className="text-xs text-gray-400">{store.totalRatings} rating{store.totalRatings !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="border-t border-gray-50 pt-3 mt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Your rating:</p>
            <StarRating value={store.userRating} readonly size="sm" />
          </div>
          <button
            onClick={() => onRate(store)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            {store.userRating ? 'Update' : 'Rate'} →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stores List ───────────────────────────────────────────────────────────────
function StoresList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [ratingModal, setRatingModal] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search.name) params.name = search.name;
    if (search.address) params.address = search.address;
    storesAPI.getAll(params).then(setStores).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openRateModal = (store) => {
    setRatingModal(store);
    setSelectedRating(store.userRating || 0);
  };

  const handleSubmitRating = async () => {
    if (!selectedRating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      if (ratingModal.userRatingId) {
        await ratingsAPI.update(ratingModal.userRatingId, { rating: selectedRating });
      } else {
        await ratingsAPI.create({ storeId: ratingModal.id, rating: selectedRating });
      }
      toast.success('Rating submitted!');
      setRatingModal(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">All Stores</h2>
        <span className="text-sm text-gray-500">{stores.length} store{stores.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <input className="input-field" placeholder="🔍 Search by store name..."
          value={search.name} onChange={e => setSearch(s => ({ ...s, name: e.target.value }))} />
        <input className="input-field" placeholder="📍 Search by address..."
          value={search.address} onChange={e => setSearch(s => ({ ...s, address: e.target.value }))} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : stores.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🏪</div>
          <p>No stores found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map(store => (
            <StoreCard key={store.id} store={store} onRate={openRateModal} />
          ))}
        </div>
      )}

      {/* Rating Modal */}
      <Modal isOpen={!!ratingModal} onClose={() => setRatingModal(null)} title={`Rate "${ratingModal?.name}"`} size="sm">
        <div className="text-center space-y-4">
          <p className="text-gray-500 text-sm">Select your rating (1–5 stars)</p>
          <div className="flex justify-center">
            <StarRating value={selectedRating} onChange={setSelectedRating} size="lg" />
          </div>
          <p className="text-sm text-gray-400">
            {selectedRating === 0 ? 'Click a star to rate' :
             selectedRating === 1 ? 'Poor' : selectedRating === 2 ? 'Fair' :
             selectedRating === 3 ? 'Good' : selectedRating === 4 ? 'Very Good' : 'Excellent'}
          </p>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmitRating} disabled={submitting || !selectedRating} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : ratingModal?.userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
            <button onClick={() => setRatingModal(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
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
  { to: '/user', label: 'Stores', icon: '🏪', end: true },
  { to: '/user/settings', label: 'Settings', icon: '⚙️' },
];

export default function UserDashboard() {
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
            <Route index element={<StoresList />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
