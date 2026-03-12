// src/components/QuotedMessage.jsx
// Shows the quoted message inside a bubble.
// Props:
//   senderName  — "You" or contact name
//   text        — quoted text
//   onClick     — scrolls to original message

function QuotedMessage({ senderName, text, onClick }) {
  return (
    <div className="quoted-message" onClick={onClick}>
      <div className="quoted-message-bar" />
      <div className="quoted-message-content">
        <span className="quoted-message-name">{senderName}</span>
        <span className="quoted-message-text">
          {text?.length > 80 ? text.slice(0, 80) + '…' : text}
        </span>
      </div>
    </div>
  );
}

export default QuotedMessage;