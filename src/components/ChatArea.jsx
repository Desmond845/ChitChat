// src/components/ChatArea.jsx
import { useRef, useEffect, useState, useCallback } from "react";
import {
  EllipsisVerticalIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import MessageBubble from "./MessageBubble";
import Avatar from "./Avatar";
import { formatChatDate, getRelativeDateLabel } from "../utils/dateHelpers";
import cleanName from "../utils/formatter";
import TypingBubble from "./TypingBubble";
const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "";
    const date = new Date(lastSeen);
  const diffMs = Date.now() - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return date.toLocaleDateString();
};

function ChatArea({ 
  messages,
  contactName,
  contactStatus,
  currentUserId,
  editingMessage,
  onEditMessage,
  onUpdateMessage,
  onDeleteMessage,
  onReact,
  contactAvatar,
  onNameClick,
  onOpenProfile,
  onLogout,
  onBack,
  onReply,
  isTyping,
  onScrollToMessage
}) {
  const messagesEndRef = useRef(null);
  const [editText, setEditText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('')
  const [matchIndexes, setMatchIndexes] = useState([])
  const [currentMatch, setCurrentMatch] = useState(0)

// Add these states:
const [showScrollBtn, setShowScrollBtn] = useState(false);
const [floatingDate, setFloatingDate]   = useState('');
const [showFloating, setShowFloating]   = useState(false);
const floatingTimerRef = useRef(null);
// const messagesRef = useRef(null); // attach to .chat-messages div

// Scroll handler:
const handleScroll = useCallback(() => {
  const el = messagesEndRef.current;
  if (!el) return;

  // Show/hide scroll-to-bottom button
  const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  setShowScrollBtn(distFromBottom > 200);

  // Find which date group is currently at the top of the viewport
  const dividers = el.querySelectorAll('[data-date-label]');
  let currentLabel = '';
  dividers.forEach((d) => {
    if (d.getBoundingClientRect().top <= el.getBoundingClientRect().top + 60) {
      currentLabel = d.getAttribute('data-date-label');
    }
  });
  if (currentLabel) {
    setFloatingDate(currentLabel);
    setShowFloating(true);
    clearTimeout(floatingTimerRef.current);
    floatingTimerRef.current = setTimeout(() => setShowFloating(false), 3000);
  }
}, []);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollTo({ top: messagesEndRef.current.scrollHeight, behavior: 'smooth' });
};



  useEffect(() => {
  if (!searchQuery.trim()) {
    setMatchIndexes([]);
    setCurrentMatch(0);
    return;
  }

  const lower = searchQuery.toLowerCase();
  const indexes = [];

  messages.forEach((msg, index) => {
    if (msg.text?.toLowerCase().includes(lower)) {
      indexes.push(index);
    }
  });

  setMatchIndexes(indexes);
  setCurrentMatch(0); // reset to first match
}, [searchQuery, messages]);

const goToMatch = (matchPos) => {
  if (matchIndexes.length === 0) return;
  const msgIndex = matchIndexes[matchPos];
  const msg = messages[msgIndex];
  const msgId = (msg.id || msg.tempId || '').toString();
  onScrollToMessage(msgId); // reuse your existing function!
};

const nextMatch = () => {
  const next = (currentMatch + 1) % matchIndexes.length;
  setCurrentMatch(next);
  goToMatch(next);
};

const prevMatch = () => {
  const prev = (currentMatch - 1 + matchIndexes.length) % matchIndexes.length;
  setCurrentMatch(prev);
  goToMatch(prev);
};

const menuRef = useRef(null);

useEffect(() => {
  const handleClick = (e) => {
    if(menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown',handleClick);

}, [])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (editingMessage) setEditText(editingMessage.text);
  }, [editingMessage]);

  // No contact selected — desktop placeholder (mobile never shows this state)
  if (!contactName) {
    return (
      <div className="chat-no-contact-screen">
        <div className="chat-no-contact-icon">
          <img src="/icon.jpg" alt="Chit Chat"></img>
        </div>
        <div className="chat-no-contact-title">Welcome to Chit Chat</div>
        <div className="chat-no-contact-desc">
          Select a contact to start chatting
        </div>
      </div>
    );
  }

  const handleSaveEdit = () => {
    if (editText.trim() && editingMessage) {
      onUpdateMessage(editingMessage.id, editText);
      onEditMessage(null);
    }
  };

  let lastDate = null;
  const messageElements = [];
  messages.forEach((msg, index) => {
    const dateLabel = formatChatDate(msg.createdAt);
    if (dateLabel !== lastDate) {
      messageElements.push(
        <div key={`date-${dateLabel}-${index}`} className="chat-date-divider" data-date-label={dateLabel}>
          <span className="chat-date-label">{dateLabel}</span>
        </div>
      );
      lastDate = dateLabel;
    }
    messageElements.push(
      <MessageBubble
        key={msg.tempId || msg.id}
        msgId={(msg.id || msg.tempId || 0).toString()}
        message={msg}
        currentUserId={currentUserId}
        onEdit={onEditMessage}
        onDelete={onDeleteMessage}
        onReact={onReact}
        onReply={onReply}
        contactName={contactName}
        onScrollToMessage={onScrollToMessage}
        searchQuery={searchQuery}
      />
    );
  });
  
  return (
    <>
      {/* Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={onBack()} aria-label="Back">
          <ArrowLeftIcon style={{ width: 20, height: 20 }} />
        </button>
        <Avatar src={contactAvatar} username={cleanName(contactName)} size={40} />
        <div className="chat-header-info">
          <button className="chat-contact-name" onClick={onNameClick}>
            {cleanName(contactName)}
            {(cleanName(contactName) === "Chitchat Official" ||
              cleanName(contactName) === "Chitchat Updates") && (
              <span className="verified-badge"> ✅</span>
            )}
          </button>
          {/* {contactStatus && (
            <div className={`chat-contact-status  ${contactStatus === 'online' ? 'online' : ''}`}>
              {contactStatus === null || contactStatus === "online" ? (
                <><div className="online-dot" /> Online</>
              ) : (
                `Last seen ${formatLastSeen(contactStatus)}
              `)}
            </div>

          )} */}
          <div
            className={`chat-contact-status ${
              contactStatus === "online" ? "online" : ""
            }`}
          >
            {isTyping ? (
              <span
                style={{
                  color: "#60a5fa",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span className="typing-dots">
                  <span />
                  <span />
                  <span />
                </span>{" "}
                typing…
              </span>
            ) : cleanName(contactName) === "Chitchat Official" ||
              cleanName(contactName) === "Chitchat Updates" ? (
              <>
                <div className="official-channel">Official Channel</div>
              </>
            ) : contactStatus === "online" ? (
              <>
                <div className="online-dot" /> Online
              </>
            ) : contactStatus ? (
              `Last seen ${formatLastSeen(contactStatus)}
  `
            ) : null}
          </div>
        </div>
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            className="sidebar-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <EllipsisVerticalIcon style={{ width: 20, height: 20 }} />
          </button>
          {menuOpen && (
            <div className="app-dropdown" onClick={() => setMenuOpen(false)}>
              <button className="app-dropdown-item" onClick={() => setSearchMode(true)}>
             Search
              </button>
              <div className="app-dropdown-divider" />
              <button className="app-dropdown-item" onClick={onOpenProfile}>
                View Profile
              </button>
              {/*
            <button className="app-dropdown-item danger" onClick={onLogout}>Logout</button> */}
            </div>
          )}
        </div>
      </div>
{searchMode && (
  <div className="chat-search-bar">
    <input
      className="chat-search-input"
      placeholder="Search messages..."
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
      autoFocus
    />
    <span className="chat-search-counter">
      {matchIndexes.length === 0
        ? '0/0'
        : `${currentMatch + 1}/${matchIndexes.length}`}
    </span>
    <button
      className="chat-search-nav"
      onClick={prevMatch}
      disabled={matchIndexes.length === 0}
    >↑</button>
    <button
      className="chat-search-nav"
      onClick={nextMatch}
      disabled={matchIndexes.length === 0}
    >↓</button>
    <button
      className="chat-search-nav"
      onClick={() => {
        setSearchMode(false);
        setSearchQuery('');
        setMatchIndexes([]);
      }}
    >✕</button>
  </div>
)}
      {/* Edit bar */}
      {editingMessage && (
        <div className="chat-edit-bar">
          <span className="chat-edit-label">✏ Editing</span>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveEdit();
              if (e.key === "Escape") onEditMessage(null);
            }}
            className="chat-edit-input"
            autoFocus
          />
          <button onClick={handleSaveEdit} className="chat-edit-save">
            Save
          </button>
          <button
            onClick={() => onEditMessage(null)}
            className="chat-edit-cancel"
          >
            Cancel
          </button>
        </div>
      )}
{/* Floating date pill */}
{showFloating && (
  <div className="chat-floating-date">
    {floatingDate}
  </div>
)}

{/* Scroll to bottom */}
{showScrollBtn && (
  <button className="chat-scroll-btn" onClick={scrollToBottom} aria-label="Scroll to bottom">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
         stroke="currentColor" strokeWidth="2.5" 
         strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>
)}
      {/* Messages */}
      {messages.length === 0 ? (
        <div className="chat-messages" ref={messagesEndRef} onScroll={handleScroll}>
          <div className="chat-empty">
            <div className="chat-empty-icon">👋</div>
            <div className="chat-empty-title">Start the conversation</div>
            <div className="chat-empty-desc">Say hi to {cleanName(contactName)}!</div>
          </div>
        </div>
      ) : (
        <div className="chat-messages" ref={messagesEndRef} onScroll={handleScroll}>
          {messageElements}
          {isTyping && (
 <TypingBubble
 contactAvatar={contactAvatar}
 contactName={contactName}
 />
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </>
  );
}

export default ChatArea;
