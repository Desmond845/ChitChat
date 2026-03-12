// src/components/ProfileSettings.jsx
import { useState, useRef } from 'react';
import Avatar from './Avatar';
import cleanName from '../utils/formatter';

const API_BASE = import.meta.env.VITE_API_URL;

function ProfileSettings({ currentUser, onBack, onAvatarUpload, onBioUpdate, onUsernameUpdate, onLogout }) {
    const [editingUsername, setEditingUsername] = useState(false);
    const [editingBio, setEditingBio] = useState(false);
    const [usernameInput, setUsernameInput] = useState(currentUser.username || '');
    const [bioInput, setBioInput] = useState(currentUser.bio || '');
    const [usernameError, setUsernameError] = useState('');
    const [bioError, setBioError] = useState('');
    const [savingUsername, setSavingUsername] = useState(false);
    const [savingBio, setSavingBio] = useState(false);
    const [notifEnabled, setNotifEnabled] = useState(Notification.permission === 'granted');
    const [notifLoading, setNotifLoading] = useState(false);
    const fileInputRef = useRef(null);

    // ── Username save ──────────────────────────────────────────
    const handleSaveUsername = async () => {
        const trimmed = usernameInput.trim();
        if (!trimmed) return setUsernameError('Username cannot be empty');
        if (trimmed.length < 3) return setUsernameError('At least 3 characters');
        if (trimmed.length > 20) return setUsernameError('Max 20 characters');
        if (trimmed === currentUser.username) { setEditingUsername(false); return; }

        setSavingUsername(true);
        setUsernameError('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/auth/username`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ username: trimmed }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');
            console.log(data);
            onUsernameUpdate(data.username);
            setEditingUsername(false);
        } catch (err) {
            setUsernameError(err.message);
        } finally {
            setSavingUsername(false);
        }
    };

    // ── Bio save ───────────────────────────────────────────────
    const handleSaveBio = async () => {
        if (bioInput.length > 120) return setBioError('Max 120 characters');
        setSavingBio(true);
        setBioError('');
        try {
            const token = localStorage.getItem('token');
            // const res = await fetch(`${API_BASE}/api/users/bio`, {
            const res = await fetch(`${API_BASE}/api/users/me`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bio: bioInput }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');
            onBioUpdate(bioInput);
            setEditingBio(false);
        } catch (err) {
            setBioError(err.message);
        } finally {
            setSavingBio(false);
        }
    };

    // ── Notification toggle ────────────────────────────────────
    const handleNotifToggle = async () => {
        if (notifEnabled) {
            // Can't programmatically revoke — guide user
            alert('To disable notifications, go to your browser settings and block notifications for this site.');
            return;
        }
        setNotifLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const { subscribeToPush } = await import('../utils/pushNotifications');
                const token = localStorage.getItem('token');
                await subscribeToPush(token);
                setNotifEnabled(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setNotifLoading(false);
        }
    };

    return (
        <div className="profile-settings">

            {/* Header */}
            <div className="ps-header">
                <button className="ps-back-btn" onClick={onBack} aria-label="Go back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <span className="ps-title">My Profile</span>
            </div>

            <div className="ps-body">

                {/* Avatar section */}
                <div className="ps-avatar-section">
                    <div className="ps-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
                        <Avatar src={currentUser.avatar} username={currentUser.username} size={88} />
                        <div className="ps-avatar-overlay">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('avatar', file);
                            const token = localStorage.getItem('token');
                            try {
                                const res = await fetch(`${API_BASE}/api/users/avatar`, {
                                    method: 'POST',
                                    headers: { Authorization: `Bearer ${token}` },
                                    body: formData,
                                });
                                const data = await res.json();
                                if (res.ok) onAvatarUpload(data.avatar);
                            } catch (err) {
                                console.error(err);
                            }
                        }}
                    />
                    <div className="ps-avatar-hint">Tap to change photo</div>
                </div>

                {/* Account section */}
                <div className="ps-section">
                    <div className="ps-section-label">ACCOUNT</div>

                    {/* Username */}
                    <div className="ps-field">
                        <div className="ps-field-label">Username</div>
                        {editingUsername ? (
                            <div className="ps-field-edit">
                                <input
                                    className={`ps-input ${usernameError ? 'error' : ''}`}
                                    value={cleanName(usernameInput)}
                                    onChange={e => { setUsernameInput(e.target.value); setUsernameError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveUsername()}
                                    autoFocus
                                    maxLength={20}
                                    placeholder="Enter username"
                                />
                                {usernameError && <span className="ps-error">{usernameError}</span>}
                                <div className="ps-field-actions">
                                    <button className="ps-btn-cancel" onClick={() => { setEditingUsername(false); setUsernameInput(currentUser.username); setUsernameError(''); }}>
                                        Cancel
                                    </button>
                                    <button className="ps-btn-save" onClick={handleSaveUsername} disabled={savingUsername}>
                                        {savingUsername ? 'Saving…' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="ps-field-row" onClick={() => setEditingUsername(true)}>
                                <span className="ps-field-value">{cleanName(currentUser.username)}</span>
                                <span className="ps-field-edit-icon">✏️</span>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="ps-field">
                        <div className="ps-field-label">Bio</div>
                        {editingBio ? (
                            <div className="ps-field-edit">
                                <textarea
                                    className={`ps-input ps-textarea ${bioError ? 'error' : ''}`}
                                    value={bioInput}
                                    onChange={e => { setBioInput(e.target.value); setBioError(''); }}
                                    autoFocus
                                    maxLength={120}
                                    rows={3}
                                    placeholder="Write something about yourself…"
                                />
                                <div className="ps-char-count">{bioInput.length}/120</div>
                                {bioError && <span className="ps-error">{bioError}</span>}
                                <div className="ps-field-actions">
                                    <button className="ps-btn-cancel" onClick={() => { setEditingBio(false); setBioInput(currentUser.bio || ''); setBioError(''); }}>
                                        Cancel
                                    </button>
                                    <button className="ps-btn-save" onClick={handleSaveBio} disabled={savingBio}>
                                        {savingBio ? 'Saving…' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="ps-field-row" onClick={() => setEditingBio(true)}>
                                <span className="ps-field-value ps-bio-value">
                                    {currentUser.bio || <span className="ps-placeholder">Add a bio…</span>}
                                </span>
                                <span className="ps-field-edit-icon">✏️</span>
                            </div>
                        )}
                    </div>

                    {/* User ID — read only */}
                    <div className="ps-field">
                        <div className="ps-field-label">Your ID</div>
                        <div className="ps-field-row ps-field-readonly">
                            <span className="ps-field-value ps-id-value">{currentUser.id}</span>
                            <span className="ps-field-badge">Read only</span>
                        </div>
                    </div>
                </div>

                {/* Notifications section */}
                <div className="ps-section">
                    <div className="ps-section-label">NOTIFICATIONS</div>
                    <div className="ps-field">
                        <div className="ps-field-row ps-toggle-row">
                            <div>
                                <div className="ps-field-label" style={{ marginBottom: '2px' }}>Push Notifications</div>
                                <div className="ps-field-sub">Get notified when you receive messages</div>
                            </div>
                            <button
                                className={`ps-toggle ${notifEnabled ? 'on' : 'off'} ${notifLoading ? 'loading' : ''}`}
                                onClick={handleNotifToggle}
                                disabled={notifLoading}
                                aria-label="Toggle notifications"
                            >
                                <span className="ps-toggle-knob" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Danger section */}
                <div className="ps-section">
                    <div className="ps-section-label">ACCOUNT ACTIONS</div>
                    <div className="ps-field">
                        <button className="ps-logout-btn" onClick={onLogout}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Log Out
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProfileSettings;