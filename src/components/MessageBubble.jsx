// src/components/MessageBubble.jsx
import { useState } from "react";
import useLongPress from "../hooks/useLongPress";
import { formatTime } from "../utils/dateHelpers";
import MessageOptions from "./MessageOptions";
import cleanName from "../utils/formatter";

const MAX_PREVIEW = 500;

function MessageBubble({
  message,
  currentUserId,
  onEdit,
  onDelete,
  contactName,
}) {
  const isMe = message.senderId === currentUserId;
const isUpdates = cleanName(contactName) === "Chitchat Updates";
  const isOfficial = cleanName(contactName) === "Chitchat Official";
  const [expanded, setExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const canEdit = isMe && !isUpdates;
  const canDelete = !isUpdates && !isOfficial;

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

  return (
    <>
      <div className={`msg-row ${isMe ? "me" : "them"}`} {...longPressHandlers}>
        <div className={`msg-bubble ${isMe ? "me" : "them"}`}>
          <p className="msg-text">{displayed}</p>

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

          <div className="msg-footer">
            <span className="msg-time">{formatTime(message.createdAt)}</span>
            {message.edited && <span className="msg-edited">(edited)</span>}
            {isMe && <span className="msg-status">{statusIcon()}</span>}
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
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </>
  );
}

export default MessageBubble;
