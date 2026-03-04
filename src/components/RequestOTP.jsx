import { useState } from 'react';
import { toast } from 'react-hot-toast';
const API_BASE = import.meta.env.VITE_API_URL;

function RequestOTP({ onNext }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('OTP sent to your email');
        onNext(email);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(`Something went wrong: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">Enter your email</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 border rounded mb-4"
      />
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
    </form>
  );

}
export default RequestOTP;