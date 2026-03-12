// src/utils/pushNotifications.js

const PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Convert VAPID public key to the format browser needs
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
};

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return null;
  
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registered');
    return reg;
  } catch (err) {
    console.error('SW registration failed:', err);
    return null;
  }
};

export const subscribeToPush = async (token) => {
  try {
    const reg = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      // Already subscribed, just save to backend
      await saveSubscription(existing, token);
      return existing;
    }

    // Subscribe
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY)
    });

    await saveSubscription(subscription, token);
    return subscription;

  } catch (err) {
    console.error('Push subscription failed:', err);
    return null;
  }
};

const saveSubscription = async (subscription, token) => {
  await fetch(`${import.meta.env.VITE_API_URL}/api/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ subscription })
  });
};

export const requestPermissionAfterMessage = async (token) => {
  // Only ask if not already decided
  if (Notification.permission !== 'default') return;

  // Wait 5 seconds like you wanted
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Ask again in case it changed
  if (Notification.permission !== 'default') return;

  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    await subscribeToPush(token);
  }
};