// src/components/MessageOptions.jsx
// Inline dropdown on long-press instead of a jarring modal
import { useEffect, useRef } from 'react';

function MessageOptions({ isOpen, onClose, onEdit, onDelete, canEdit, canDelete }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        ref={ref}
        className="msg-options-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {canEdit && (
          <button className="msg-options-btn" onClick={onEdit}>
            ✏ Edit
          </button>
        )}
        {canDelete && (
          <button className="msg-options-btn danger" onClick={onDelete}>
            🗑 Delete
          </button>
        )}
        <button className="msg-options-btn" onClick={onClose}>
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}

export default MessageOptions;