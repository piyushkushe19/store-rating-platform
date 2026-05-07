import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function ChangePasswordForm({ onClose }) {
  const { updatePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Required';
    if (!form.newPassword) e.newPassword = 'Required';
    else if (form.newPassword.length < 8 || form.newPassword.length > 16)
      e.newPassword = 'Must be 8-16 characters';
    else if (!/[A-Z]/.test(form.newPassword))
      e.newPassword = 'Must contain at least one uppercase letter';
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.newPassword))
      e.newPassword = 'Must contain at least one special character';
    if (form.newPassword !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await updatePassword(form.currentPassword, form.newPassword);
      toast.success('Password updated successfully');
      onClose?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { key: 'currentPassword', label: 'Current Password' },
        { key: 'newPassword', label: 'New Password' },
        { key: 'confirm', label: 'Confirm New Password' },
      ].map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input
            type="password"
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className={`input-field ${errors[key] ? 'border-red-400' : ''}`}
          />
          {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        )}
      </div>
    </form>
  );
}
