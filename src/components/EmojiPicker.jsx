// src/components/EmojiPicker.jsx
// Floating emoji picker for message reactions.

const EMOJIS = ["❤️", "😂", "😮", "😢", "😡", "👍", "👎", "🔥"];

function EmojiPicker({ onReact, onClose, currentEmoji }) {
  return (
    <>
      {/* Invisible backdrop to close on outside click */}
      <div className="emoji-picker-backdrop" onClick={onClose} />

      <div className="emoji-picker">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            className={`emoji-picker-btn ${
              currentEmoji === emoji ? "active" : ""
            }`}
            onClick={() => {
              onReact(emoji);
              onClose();
            }}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}

export default EmojiPicker;
