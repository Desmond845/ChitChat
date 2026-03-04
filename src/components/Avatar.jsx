// src/components/Avatar.jsx
import { useState, useEffect } from "react";

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#65a30d",
];

function Avatar({ src, username, size = 40, onClick, style }) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    if (src && !src.includes("default-avatar")) {
      setImgSrc(`${src}?t=${Date.now()}`);
      setError(false);
    } else if (src && src.includes("default-avatar")) {
      setImgSrc(src);
      setError(false);
    } else {
      setImgSrc(null);
      setError(false);
    }
  }, [src]);

  const colorIndex = username ? username.charCodeAt(0) % COLORS.length : 0;
  const bgColor = COLORS[colorIndex];
  const fontSize = size <= 32 ? "0.75rem" : size <= 48 ? "1rem" : "1.25rem";

  if (imgSrc && !error) {
    return (
      <img
        src={imgSrc}
        alt={username || "avatar"}
        className="avatar"
        style={{
          width: size,
          height: size,
          cursor: onClick ? "pointer" : "default",
          ...style,
        }}
        onError={() => setError(true)}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className="avatar-fallback"
      style={{
        width: size,
        height: size,
        background: bgColor,
        fontSize,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onClick={onClick}
    >
      {username ? username[0].toUpperCase() : "?"}
    </div>
  );
}

export default Avatar;
