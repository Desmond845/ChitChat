// src/components/MessageInput.jsx
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

function MessageInput({ value, onChange, onSend, disabled }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      {disabled && (
        <div className="msg-input-disabled-note">
          This is a read-only channel — you cannot send messages here.
        </div>
      )}
      <div className="msg-input-bar">
        <div className="msg-input-wrap">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Read-only channel' : 'Type a message…'}
            className="msg-input"
            disabled={disabled}
          />
        </div>
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="msg-send-btn"
          title="Send message"
        >
          <PaperAirplaneIcon style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </>
  );
}

export default MessageInput;