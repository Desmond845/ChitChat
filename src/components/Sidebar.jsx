
// src/components/Sidebar.jsx
import { useState, useRef, useEffect } from 'react';
import { EllipsisVerticalIcon, UserCircleIcon, ArrowRightOnRectangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Avatar from './Avatar';
import toast from 'react-hot-toast';
import cleanName from '../utils/formatter';
function Sidebar({ contacts, selectedContactId, onSelectContact, onAddContact, ownId, subTexts, unreadCounts, currentUserAvatar, onAvatarClick, onViewProfile, onLogout, ownName, onDiscoverClick, mobileHidden, contactsLoading, onOpenProfile  }) {
  const [searchId, setSearchId]   = useState('');
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const menuRef = useRef(null);




  //  const [menuOpen, setMenuOpen] = useState(false);
  // const menuRef = useRef(null);
  useEffect(() => {
    const handleClick = (e) => {
      if(menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown',handleClick);
  
  }, [])
const API_BASE = import.meta.env.VITE_API_URL;

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${API_BASE}/api/auth/find?id=${searchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data  = await res.json();
      if (!res.ok) throw new Error(data.error);
      onAddContact(data);
      setSearchId('');
    } catch (err) {
      toast.error('User not found' + err);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className={`sidebar ${mobileHidden ? 'mobile-hidden' : ''}`}>
      {/* Header */}
      {/* <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">💬</div>
          <span className="sidebar-brand-name">Chit Chat</span>
        </div> */}
        <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><img src="/icon.jpg"></img></div>
          <span className="sidebar-brand-name">Chit Chat</span>
        </div>

        {/* Menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button className="sidebar-menu-btn" onClick={() => setMenuOpen(o => !o)}>
            <EllipsisVerticalIcon style={{ width: 20, height: 20 }} />
          </button>
          {menuOpen && (
            <div className="app-dropdown" onClick={() => setMenuOpen(false)}>
              <button className="app-dropdown-item" onClick={onOpenProfile}>
                <UserCircleIcon style={{ width: 16, height: 16 }} /> My Profile
              </button>
              <div className="app-dropdown-divider" />
              <button className="app-dropdown-item danger" onClick={onLogout}>
                <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User info strip */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar-wrap">
          <Avatar src={currentUserAvatar} username={cleanName(ownName)} size={40} onClick={onAvatarClick} style={{ cursor: 'pointer' }} />
          <button className="sidebar-avatar-edit-btn" onClick={onAvatarClick} title="Change avatar">✎</button>
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-username">{cleanName(ownName)}</div>
          <div className="sidebar-user-id">ID: {ownId}</div>
        </div>
      </div>

      {/* Add friend */}
      <div className="sidebar-add-friend">
        <input
          type="text"
          placeholder="Enter friend's 7-digit ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={handleKeyDown}
          className="sidebar-input"
        />
        <button onClick={handleSearch} disabled={searching} className="sidebar-btn sidebar-btn-primary">
          {searching ? 'Searching…' : '+ Add Friend'}
        </button>
        <button onClick={onDiscoverClick} className="sidebar-btn sidebar-btn-discover">
          <MagnifyingGlassIcon style={{ width: 15, height: 15 }} /> Discover People
        </button>
      </div>

      {/* Contacts */}
      <div className="sidebar-contacts">


 {contactsLoading ? (
// Loading skeletons
          [1, 2, 3, 4].map(i => (
            <div key={i} className="contact-skeleton">
              <div className="skeleton-avatar" />
              <div className="skeleton-lines">
                <div className="skeleton-line skeleton-name" />
                <div className="skeleton-line skeleton-sub" />
              </div>
            </div>
          ))
        ) : contacts.length === 0 ? (
          <div className="sidebar-empty">
            <div className="sidebar-empty-icon">👥</div>
            <p className="sidebar-empty-text">No contacts yet</p>
            <p className="sidebar-empty-sub">Search for a friend to get started</p>
          </div>
        ) : (


        contacts.map((contact) => {

const sub    = subTexts.find(c => contact._id === c.id);
          const unread = unreadCounts[contact._id] || 0;
          return (
            <div
              key={contact._id}
              className={`contact-item ${selectedContactId === contact._id ? 'active' : ''}`}
              onClick={() => onSelectContact(contact._id)}
            >
              <Avatar src={contact.avatar} username={cleanName(contact.username)} size={42} />
              <div className="contact-info">
                <div className="contact-name">
                  {cleanName(contact.username) || contact.shortId || contact._id}
                  {cleanName(contact.username) === 'Chitchat Updates' || cleanName(contact.username) === 'Chitchat Official' ? (
                    <span className="verified-badge"> ✅</span>
                  ) : null}
                </div>
                <div className={`contact-subtext ${sub?.isTyping ? 'typing' : ''}`}>
                  {sub?.text || ''}
                </div>
              </div>
              {unread > 0 && (
                <div className="contact-unread">{unread > 99 ? '99+' : unread}</div>
              )}
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}

export default Sidebar;