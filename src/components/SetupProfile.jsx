import { useState } from 'react';
import { toast } from 'react-hot-toast';

function SetupProfile({ tempToken, email, onComplete, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extract suggested username from email (before @)
  const suggested = email.split('@')[0];
const API_BASE = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!terms) {
      toast.error('You must accept the terms');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/complete-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, username, password, termsAccepted: terms })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Account created!');
        onComplete(data); // passes user data to Auth
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(`Signup failed ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create your profile</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full p-2 border rounded mb-4"
      />
      <input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength="6"
        required
        className="w-full p-2 border rounded mb-4"
      />
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="terms"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="terms">I accept the <a href="../../public/terms.html" target="_blank" className="text-blue-500">Terms and Privacy Policy</a></label>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded">
        {loading ? 'Creating...' : 'Create Account'}
      </button>
      <button type="button" onClick={onBack} className="w-full text-gray-500 mt-4">
        Back
      </button>
    </form>
  );
}
export default SetupProfile;