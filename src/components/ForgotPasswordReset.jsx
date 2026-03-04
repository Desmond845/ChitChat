import { useState } from 'react';
import { toast } from 'react-hot-toast';
const API_BASE = import.meta.env.VITE_API_URL;

function ForgotPasswordReset({ resetToken, onComplete }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: password })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated! You can now log in.');
        onComplete();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(`Failed to reset password: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">New Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength="6"
        required
        className="w-full p-2 border rounded mb-4"
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        minLength="6"
        required
        className="w-full p-2 border rounded mb-4"
      />
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
export default ForgotPasswordReset;