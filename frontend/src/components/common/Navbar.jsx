import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const roleLabels = { ADMIN: 'Administrator', USER: 'User', STORE_OWNER: 'Store Owner' };
const roleBadgeColors = {
  ADMIN: 'bg-purple-100 text-purple-700',
  USER: 'bg-blue-100 text-blue-700',
  STORE_OWNER: 'bg-green-100 text-green-700',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SR</span>
        </div>
        <span className="font-semibold text-gray-800 text-lg">Store Rating</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">{user?.name?.split(' ').slice(0, 2).join(' ')}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadgeColors[user?.role]}`}>
          {roleLabels[user?.role]}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
