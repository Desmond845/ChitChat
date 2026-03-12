// src/components/ProfileModal.jsx
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PencilIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import cleanName from '../utils/formatter';
import Avatar from './Avatar';
const API_BASE = import.meta.env.VITE_API_URL;

function ProfileModal({ isOpen, onClose, userId, currentUserId, onAvatarClick, onBioUpdate }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio]         = useState('');
  const [saving, setSaving]   = useState(false);
  const isOwn = userId === currentUserId;

  useEffect(() => {
    if (!userId || !isOpen) return;
    const fetch_ = async () => {
      setLoading(true);
      try {
        const token    = localStorage.getItem('token');
        const endpoint = isOwn
          ? `${API_BASE}/api/users/me`
          : `${API_BASE}/api/auth/${userId}`;
        const res  = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setBio(data.bio || '');
          onBioUpdate(data.bio || '');
        } else throw new Error(data.error);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [userId, isOpen, isOwn]);

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bio }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setEditing(false);
        onBioUpdate(bio);
        toast.success('Bio updated!');
      } else throw new Error(data.error);
    } catch (err) {
      toast.error('Failed to save bio: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="modal-backdrop" aria-hidden="true" />
      <div className="modal-wrap">
        <Dialog.Panel className="modal-panel">
          <div className="modal-header">
            <Dialog.Title className="modal-title">
              {isOwn ? 'My Profile' : 'Profile'}
            </Dialog.Title>
            <button className="modal-close-btn" onClick={onClose}>
              <XMarkIcon style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="loading-spinner" />
            </div>
          ) : user ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {/* Avatar */}
              <div className="profile-avatar-wrap">
                <Avatar src={user.avatar} username={cleanName(user.username)} size={88} />
                {isOwn && (
                  <button
                    className="profile-avatar-edit"
                    onClick={() => { onClose(); onAvatarClick(); }}
                    title="Change photo"
                  >
                    <PencilIcon style={{ width: 13, height: 13 }} />
                  </button>
                )}
              </div>

              <div>
                <div className="profile-username">{cleanName(user.username)}</div>
                <div className="profile-user-id">ID: {user.id}</div>
              </div>
{/* Bio */}
              <div style={{ width: '100%' }}>
                {isOwn && editing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write something about yourself…"
                      className="profile-bio-textarea"
                      rows={3}
                      maxLength={200}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setEditing(false); setBio(user.bio || ''); }}
                        className="modal-btn modal-btn-ghost"
                        style={{ flex: 'none', padding: '0.4rem 0.875rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveBio}
                        disabled={saving}
                        className="modal-btn modal-btn-primary"
                        style={{ flex: 'none', padding: '0.4rem 0.875rem' }}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="profile-bio-box"
                    onClick={() => isOwn && setEditing(true)}
                  >
                    {user.bio ? (
                      <p className="profile-bio-text">{user.bio}</p>
                    ) : (
                      <p className="profile-bio-empty">
                        {isOwn ? 'Click to add a bio…' : 'No bio yet.'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="profile-joined" style={{ alignSelf: 'flex-start' }}>
                <CalendarDaysIcon style={{ width: 14, height: 14 }} />
                Joined {formatDate(user.createdAt)}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#fca5a5', padding: '2rem' }}>User not found</div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export default ProfileModal;