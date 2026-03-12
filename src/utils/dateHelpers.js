// // src/utils/dateHelpers.js
export const isToday = (isoString) => {
  const date = new Date(isoString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isYesterday = (isoString) => {
  const date = new Date(isoString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

export const getRelativeDateLabel = (isoString) => {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (date > oneWeekAgo) {
    return date.toLocaleDateString([], { weekday: 'long' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
export const formatChatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();

  // Strip times for day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  if (diffDays < 365) return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};
export const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateWithTime = (isoString) => {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${formattedDate}, ${formattedTime}`;
};
export const formatMessageTime = (isoString) => {
 const date = new Date(isoString);
  const now = new Date();

  // Strip times for day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';

        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });

  
};