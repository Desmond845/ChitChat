import { useState } from 'react';
import { toast } from 'react-hot-toast';
const API_BASE = import.meta.env.VITE_API_URL;

function VerifyOTP({ email, onNext, onBack }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok) {
        onNext(data.tempToken);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(`Verification failed ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        toast.success('OTP resent');
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(`Failed to resend ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
      <p className="text-gray-600 mb-2">Enter the 6-digit code sent to {email}</p>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength="6"
        required
        className="w-full p-2 border rounded mb-4"
      />
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded mb-2">
        {loading ? 'Verifying...' : 'Verify'}
      </button>
      <button type="button" onClick={handleResend} className="w-full text-blue-500 underline">
        Resend OTP
      </button>
      <button type="button" onClick={onBack} className="w-full text-gray-500 mt-4">
        Back
      </button>
    </form>
  );
}
export default VerifyOTP;