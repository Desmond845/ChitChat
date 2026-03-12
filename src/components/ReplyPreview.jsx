// src/components/ReplyPreview.jsx
// Shows the quoted message preview above the message input.

function ReplyPreview({ senderName, text, onCancel,  }) {
  return (
    <div className="reply-preview">
      <div className="reply-preview-bar" />
      <div className="reply-preview-content" >
        <span className="reply-preview-name">{senderName}</span>
        <span className="reply-preview-text">
          {text?.length > 60 ? text.slice(0, 60) + '…' : text}
        </span>
      </div>
      <button className="reply-preview-cancel" onClick={onCancel} aria-label="Cancel reply">
        ✕
      </button>
    </div>
  );
}

export default ReplyPreview;