// src/components/MessageBubble.jsx
import { useState, useRef } from "react";
import useLongPress from "../hooks/useLongPress";
import { formatTime } from "../utils/dateHelpers";
import MessageOptions from "./MessageOptions";
import cleanName from "../utils/formatter";
import EmojiPicker from "./EmojiPicker";
import QuotedMessage from "./QuotedMessage";
const MAX_PREVIEW = 500;

function MessageBubble({
  message,
  msgId,
  currentUserId,
  onEdit,
  onDelete,
  onReact,
  contactName,
  onReply,
  onScrollToMessage,
  searchQuery
}) {
  const isMe = message.senderId === currentUserId;
  const isUpdates = cleanName(contactName) === "Chitchat Updates";
  const isOfficial = cleanName(contactName) === "Chitchat Official";
  const [expanded, setExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
const [showPicker, setShowPicker] = useState(false)
const wrapperRef  = useRef(null);
const startX      = useRef(0);
const currentX    = useRef(0);
const isSwiping   = useRef(false);

const handleTouchStart = (e) => {
  startX.current = e.touches[0].clientX;
  isSwiping.current = true;
};

const handleTouchMove = (e) => {
  if (!isSwiping.current) return;
  const diff = e.touches[0].clientX - startX.current;
  // Only allow rightward swipe, max 72px
  if (diff > 0 && diff <= 72) {
    currentX.current = diff;
    wrapperRef.current.style.transform = `translateX(${diff}px)`;
    wrapperRef.current.classList.add('swiping');
  }
};

const handleTouchEnd = () => {
  isSwiping.current = false;
  wrapperRef.current.style.transform = 'translateX(0)';
  wrapperRef.current.classList.remove('swiping');
  if (currentX.current >= 48) {
    // Trigger reply
    onReply({
      messageId:  (message.id || message._id || '').toString(),
      text:       message.text,
      senderId: message.senderId,
    });
  }
  currentX.current = 0;
};


  const canEdit = isMe && !isUpdates;
  const canDelete = !isUpdates && !isOfficial;
const canReact = !isUpdates;
  const statusIcon = () => {
    if (!isMe) return null;
    switch (message.status) {
      case "sending":
        return <span style={{ opacity: 0.5 }}>🕒</span>;
      case "sent":
        return <span style={{ opacity: 0.6 }}>✓</span>;
      case "delivered":
        return <span style={{ opacity: 0.6 }}>✓✓</span>;
      case "read":
        return <span className="msg-status read">✓✓</span>;
      default:
        return null;
    }
  };

  const isLong = message.text.length > MAX_PREVIEW;
  const displayed =
    expanded || !isLong
      ? message.text
      : message.text.slice(0, MAX_PREVIEW) + "…";

  const handleLongPress = (e) => {
    e.preventDefault();
    setShowOptions(true);
  };

  const longPressHandlers = useLongPress(handleLongPress, null, { delay: 600 });

const highlightText = (text, query) => {
  if (!query?.trim()) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  // 'gi' means global + case insensitive
  
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="search-highlight">{part}</mark>
      : part
  );
};




  return (
    <>
    <div ref={wrapperRef} id={`msg-${msgId}`} className="msg-bubble-wrapper" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} >
  <div className={`msg-row ${isMe ? "me" : "them"}`} {...longPressHandlers}>
<div className="msg-quick-actions">
  <button 
    className="msg-quick-reply"
    onClick={() =>     onReply({
      messageId:  (message.id || message._id || '').toString(),
      text:       message.text,
      senderId: message.senderId,
    })
}
    title="Reply"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" 
         stroke="currentColor" strokeWidth="2.5" 
         strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 17 4 12 9 7"/>
      <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
    </svg>
  </button>
</div>
        <div onDoubleClick={() => { if (canReact) setShowPicker(true);}} className={`msg-bubble ${isMe ? "me" : "them"}`}>
          {message.replyTo?.text && (
            <QuotedMessage senderName={message.replyTo.senderId?.toString() === currentUserId ? 'You' : cleanName(contactName)} text={message.replyTo.text} onClick={() => onScrollToMessage(message.replyTo.messageId)} />

          )}
          <p className="msg-text">{highlightText(displayed, searchQuery)}</p>

          {isLong && (
            <button
              className="msg-read-more"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}


          {/* Emoji picker */}
{showPicker && (
  <EmojiPicker
    currentEmoji={message.reactions?.find(r => r.userId === currentUserId)?.emoji}
    onReact={(emoji) => onReact(message.id || message._id, emoji)}
    onClose={() => setShowPicker(false)}
  />
)}

{/* Reaction chips */}
{message.reactions?.length > 0 && (
  <div className="msg-reactions">
    {Object.entries(
      message.reactions.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || []);
        acc[r.emoji].push(r.userId);
        return acc;
      }, {})
    ).map(([emoji, userIds]) => (
      <button
        key={emoji}
        className={`reaction-chip ${userIds.includes(currentUserId) ? 'reacted-by-me' : ''}`}
        onClick={() => onReact(message.id || message._id, emoji)}
      >
        <span className="reaction-chip-emoji">{emoji}</span>
        <span className="reaction-chip-count">{userIds.length}</span>
      </button>
    ))}
  </div>
)}
          <div className="msg-footer">
            <span className="msg-time">{formatTime(message.createdAt)}</span>
            {message.edited && <span className="msg-edited">(edited)</span>}
            {isMe && <span className="msg-status">{statusIcon()}</span>}
          </div>
        </div>
      </div>
      </div>

      <MessageOptions
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        onEdit={() => {
          setShowOptions(false);
          onEdit(message);
        }}
        onDelete={() => {
          setShowOptions(false);
          onDelete(message);
        }}
         onReact={() => {
          setShowPicker(false);
          onReact(message);
        }}
                 onReply={() => {
          setShowOptions(false);
    onReply({
      messageId:  (message.id || message._id || '').toString(),
      text:       message.text,
      senderId: message.senderId,
    });        }}

        canReact={canReact}
        // canReply={canReact}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </>
  );
}

export default MessageBubble;
