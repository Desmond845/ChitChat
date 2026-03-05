// src/components/ChatArea.jsx
import { useRef, useEffect, useState } from "react";
import {
  EllipsisVerticalIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import MessageBubble from "./MessageBubble";
import Avatar from "./Avatar";
import { getRelativeDateLabel } from "../utils/dateHelpers";
import cleanName from "../utils/formatter";

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
  contactAvatar,
  onNameClick,
  onOpenProfile,
  onLogout,
  onBack,
  isTyping,
}) {
  const messagesEndRef = useRef(null);
  const [editText, setEditText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    const dateLabel = getRelativeDateLabel(msg.createdAt);
    if (dateLabel !== lastDate) {
      messageElements.push(
        <div key={`date-${dateLabel}-${index}`} className="chat-date-divider">
          <span className="chat-date-label">{dateLabel}</span>
        </div>
      );
      lastDate = dateLabel;
    }
    messageElements.push(
      <MessageBubble
        key={msg.tempId || msg.id}
        message={msg}
        currentUserId={currentUserId}
        onEdit={onEditMessage}
        onDelete={onDeleteMessage}
        contactName={contactName}
      />
    );
  });
  return (
    <>
      {/* Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={onBack} aria-label="Back">
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
        <div style={{ position: "relative" }}>
          <button
            className="sidebar-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <EllipsisVerticalIcon style={{ width: 20, height: 20 }} />
          </button>
          {menuOpen && (
            <div className="app-dropdown" onClick={() => setMenuOpen(false)}>
              <button className="app-dropdown-item" onClick={onOpenProfile}>
                View Profile
              </button>
              {/* <div className="app-dropdown-divider" />
            <button className="app-dropdown-item danger" onClick={onLogout}>Logout</button> */}
            </div>
          )}
        </div>
      </div>

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

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="chat-messages">
          <div className="chat-empty">
            <div className="chat-empty-icon">👋</div>
            <div className="chat-empty-title">Start the conversation</div>
            <div className="chat-empty-desc">Say hi to {cleanName(contactName)}!</div>
          </div>
        </div>
      ) : (
        <div className="chat-messages">
          {messageElements}
          <div ref={messagesEndRef} />
        </div>
      )}
    </>
  );
}

export default ChatArea;
