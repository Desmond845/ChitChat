// src/components/TypingBubble.jsx

import Avatar from './Avatar';

function TypingBubble({ contactAvatar, contactName }) {
  return (
    <div className="typing-bubble-row">
      <Avatar src={contactAvatar} username={contactName} size={28} />
      <div className="typing-bubble">
        <span className="typing-bubble-dot" />
        <span className="typing-bubble-dot" />
        <span className="typing-bubble-dot" />
      </div>
    </div>
  );
}

export default TypingBubble;