// src/pages/BroadcastDashboard.jsx
// ─────────────────────────────────────────────────────────────
// Standalone admin dashboard for the ChitChat Updates account.
// Route it in main.jsx or App.jsx:
//   if (window.location.pathname === '/admin') return <BroadcastDashboard />;
//
// Design: matches Auth.css + App.css — same navy/blue palette.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL;
const API = API_BASE;

// ── tiny helpers ─────────────────────────────────────────────
const fmt = (iso) =>
  new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ══════════════════════════════════════════════════════════════
export default function BroadcastDashboard() {
  const [token,    setToken]    = useState(() => localStorage.getItem('admin_token') || '');
  const [loggedIn, setLoggedIn] = useState(false);
  const [stats,    setStats]    = useState(null);
  const [history,  setHistory]  = useState([]);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const [result,   setResult]   = useState(null); // { success, message } | { error }
  const [loadingStats, setLoadingStats] = useState(false);

  // ── auth ─────────────────────────────────────────────────
  const login = async (identifier, password) => {
    const res  = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.username !== 'ChitChat Updates') throw new Error('This dashboard is only for the ChitChat Updates account');
    localStorage.setItem('admin_token', data.token);
    setToken(data.token);
    setLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setLoggedIn(false);
    setStats(null);
    setHistory([]);
  };

  // ── fetch stats + history ─────────────────────────────────
  const fetchDashboard = async (t) => {
    setLoadingStats(true);
    try {
      const headers = { Authorization: `Bearer ${t}` };
      const [sRes, hRes] = await Promise.all([
        fetch(`${API}/api/admin/stats`,   { headers }),
        fetch(`${API}/api/admin/history`, { headers }),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (hRes.ok) setHistory(await hRes.json());
    } finally {
      setLoadingStats(false);
    }
  };

  // Try auto-login from stored token
  useEffect(() => {
    if (!token) return;
    fetchDashboard(token)
      .then(() => setLoggedIn(true))
      .catch(() => logout());
  }, []);

  // ── send broadcast ────────────────────────────────────────
  const handleBroadcast = async () => {
    if (!text.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res  = await fetch(`${API}/api/admin/broadcast`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ success: true, message: data.message });
      setText('');
      fetchDashboard(token); // refresh stats + history
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  };

  if (!loggedIn) return <LoginScreen onLogin={login} />;

  return (
    <div style={styles.root}>
      {/* Background */}
      <div style={styles.grid} />
      <div style={{ ...styles.orb, top: -200, right: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)' }} />
      <div style={{ ...styles.orb, bottom: -150, left: -80, width: 350, height: 350, background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)' }} />

      <div style={styles.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.header}
        >
          <div style={styles.headerLeft}>
<div style={styles.logoBox}>
  <img src="/logo.png" alt="Chit Chat" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
</div>            <div>
              <h1 style={styles.headerTitle}>Broadcast Dashboard</h1>
              <p style={styles.headerSub}>ChitChat Updates · Admin</p>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.statsRow}
        >
          {[
            { label: 'Total Users',    value: stats?.totalUsers   ?? '—', icon: '👥' },
            { label: 'Online Now',     value: stats?.onlineCount  ?? '—', icon: '🟢' },
            { label: 'Broadcasts Sent',value: stats?.totalMessages ?? '—', icon: '📨' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <span style={styles.statIcon}>{s.icon}</span>
              <div>
                <div style={styles.statValue}>
                  {loadingStats ? <span style={styles.skeleton} /> : s.value}
                </div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div style={styles.mainGrid}>
          {/* Compose panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={styles.card}
          >
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>New Broadcast</h2>
              <span style={styles.cardBadge}>→ All Users</span>
            </div>

            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setResult(null); }}
              placeholder="Write your announcement, update, or notice here…"
              maxLength={1000}
              rows={6}
              style={styles.textarea}
            />

            <div style={styles.composeFooter}>
              <span style={{ ...styles.charCount, color: text.length > 900 ? '#fca5a5' : 'rgba(240,244,255,0.3)' }}>
                {text.length} / 1000
              </span>
              <button
                onClick={handleBroadcast}
                disabled={sending || !text.trim()}
                style={{ ...styles.sendBtn, opacity: (sending || !text.trim()) ? 0.5 : 1 }}
              >
                {sending ? (
                  <><span style={styles.spinner} /> Sending…</>
                ) : (
                  '📡 Send to All Users'
                )}
              </button>
            </div>

            {/* Result banner */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    ...styles.resultBanner,
                    background: result.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    borderColor: result.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
                    color: result.success ? '#86efac' : '#fca5a5',
                  }}
                >
                  {result.success ? '✓' : '✗'} {result.message}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Info box */}
            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                📌 Messages are delivered instantly to online users. Offline users will see the message when they next open the app. Users <strong style={{ color: 'rgba(240,244,255,0.7)' }}>cannot reply, edit, or delete</strong> broadcast messages.
              </p>
            </div>
          </motion.div>

          {/* History panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.card}
          >
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Recent Broadcasts</h2>
              <button
                style={styles.refreshBtn}
                onClick={() => fetchDashboard(token)}
              >
                ↻ Refresh
              </button>
            </div>

            <div style={styles.historyList}>
              {loadingStats ? (
                [1,2,3].map(i => <div key={i} style={styles.historySkeletonRow} />)
              ) : history.length === 0 ? (
                <div style={styles.historyEmpty}>No broadcasts yet</div>
              ) : (
                history.map((msg, i) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={styles.historyRow}
                  >
                    <p style={styles.historyText}>{msg.text}</p>
                    <p style={styles.historyTime}>{fmt(msg.createdAt)}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── Login screen ──────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(identifier, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.grid} />
      <div style={{ ...styles.orb, top: -200, right: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={styles.loginCard}
      >
        {/* Top shimmer */}
        <div style={styles.loginShimmer} />

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={styles.loginIcon}>📡</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.375rem', fontWeight: 800, color: '#f0f4ff', margin: '0.75rem 0 0.25rem', letterSpacing: '-0.02em' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(240,244,255,0.45)', margin: 0 }}>
            Sign in with the ChitChat Updates account
          </p>
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '0.75rem', fontSize: '0.8375rem', color: '#fca5a5' }}>
            ⚠ {error}
            
            </div>
          )}
          <input
            type="text"
            placeholder="Username or email"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            style={styles.loginInput}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={styles.loginInput}
          />
          <button type="submit" disabled={loading} style={{ ...styles.sendBtn, marginTop: '0.25rem', opacity: loading ? 0.6 : 1 }}>
            {loading ? <><span style={styles.spinner} /> Signing in…</> : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: '100vh',
    background: '#060b18',
    backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37,99,235,0.15) 0%, transparent 60%)',
    fontFamily: "'Instrument Sans', sans-serif",
    color: '#f0f4ff',
    position: 'relative',
    // overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
    
  },
  grid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
  },
  orb: {
    position: 'absolute', borderRadius: '50%',
    filter: 'blur(80px)', opacity: 0.5, pointerEvents: 'none',
  },
  container: {
    position: 'relative', zIndex: 1,
    maxWidth: 1000, margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.75rem',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.875rem' },
//   logoBox: {
//     width: 46, height: 46, borderRadius: 14,
//     background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     fontSize: '1.375rem',
//     boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
//   },
logoBox: {
  width: 46, height: 46, borderRadius: 14,
  overflow: 'hidden',
  boxShadow: '0 6px 20px rgba(37,99,235,0.2)',
},

  headerTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.25rem', fontWeight: 800,
    margin: 0, letterSpacing: '-0.02em',
  },
  headerSub: { fontSize: '0.8125rem', color: 'rgba(240,244,255,0.45)', margin: 0 },
  logoutBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: 'rgba(240,244,255,0.6)',
    padding: '0.5rem 1rem', fontSize: '0.8125rem',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 180ms',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.875rem', marginBottom: '1.5rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: '1.125rem 1.25rem',
    display: 'flex', alignItems: 'center', gap: '0.875rem',
  },
  statIcon: { fontSize: '1.5rem' },
  statValue: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '1.5rem', fontWeight: 800,
    color: '#f0f4ff', lineHeight: 1,
  },
  statLabel: { fontSize: '0.75rem', color: 'rgba(240,244,255,0.45)', marginTop: 4 },
  skeleton: {
    display: 'inline-block', width: 40, height: '1em',
    background: 'rgba(255,255,255,0.08)', borderRadius: 6,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  mainGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '1.375rem',
    display: 'flex', flexDirection: 'column', gap: '1rem',
    position: 'relative', overflow: '',
  },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '0.9375rem', fontWeight: 700, margin: 0,
  },
  cardBadge: {
    background: 'rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.3)',
    color: '#60a5fa', fontSize: '0.75rem',
    fontWeight: 600, padding: '0.2rem 0.625rem',
    borderRadius: 999,
  },
  textarea: {
    width: '100%', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, color: '#f0f4ff',
    fontFamily: "'Instrument Sans', sans-serif",
    fontSize: '0.9rem', lineHeight: 1.6,
    padding: '0.875rem', resize: 'vertical',
    outline: 'none', boxSizing: 'border-box',
    minHeight: 140,
  },
  composeFooter: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '0.75rem',
  },
  charCount: { fontSize: '0.8rem', transition: 'color 200ms' },
  sendBtn: {
    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    border: 'none', borderRadius: 12,
    color: 'white', fontFamily: "'Instrument Sans', sans-serif",
    fontSize: '0.9rem', fontWeight: 600,
    padding: '0.75rem 1.5rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
    transition: 'all 180ms',
  },
  spinner: {
    display: 'inline-block',
    width: 14, height: 14,
    border: '2px solid rgba(255,255,255,0.25)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.65s linear infinite',
  },
  resultBanner: {
    border: '1px solid',
    borderRadius: 12, padding: '0.75rem 1rem',
    fontSize: '0.875rem', lineHeight: 1.5,
  },
  infoBox: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '0.875rem 1rem',
  },
  infoText: { fontSize: '0.8125rem', color: 'rgba(240,244,255,0.45)', margin: 0, lineHeight: 1.6 },
  refreshBtn: {
    background: 'none', border: 'none',
    color: '#60a5fa', fontSize: '0.8125rem',
    cursor: 'pointer', fontFamily: 'inherit',
    padding: '0.25rem 0.5rem',
  },
  historyList: {
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
    maxHeight: 360, overflowY: 'auto',
    paddingRight: 4,
  },
  historyRow: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '0.75rem 0.875rem',
  },
  historyText: {
    fontSize: '0.875rem', color: 'rgba(240,244,255,0.75)',
    margin: '0 0 0.375rem', lineHeight: 1.5,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: '',
  },
  historyTime: { fontSize: '0.75rem', color: 'rgba(240,244,255,0.3)', margin: 0 },
  historySkeletonRow: {
    height: 72, background: 'rgba(255,255,255,0.04)',
    borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite',
  },
  historyEmpty: {
    textAlign: 'center', color: 'rgba(240,244,255,0.3)',
    padding: '2rem 0', fontSize: '0.875rem',
  },
  // Login card
  loginCard: {
    position: '', top: '', left: '',
    transform: 'translate(-50%, -50%)',
    
    width: '100%', maxWidth: 380,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 24, padding: '2rem',
    backdropFilter: 'blur(32px)',
    boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
  },
  loginShimmer: {
    position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.6), transparent)',
  },
  loginIcon: {
    width: 52, height: 52, margin: '0 auto',
    background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
    borderRadius: 16, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '1.5rem',
    boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
  },
  loginInput: {
    width: '100%', padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, color: '#f0f4ff',
    fontFamily: "'Instrument Sans', sans-serif",
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  },
};