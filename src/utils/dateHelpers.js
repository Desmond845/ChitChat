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
  
  // Check if same day (ignoring time)
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    // Return time only
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    // // Return date in dd/mm/yyyy format
    // const day = date.getDate().toString().padStart(2, '0');
    // console.log(day);
    // const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });

  }
};