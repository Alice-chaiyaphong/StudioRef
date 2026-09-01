// Scripts for Firebase and Firebase Messaging in Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize Firebase inside the Service Worker
const firebaseConfig = {
  projectId: "straight-avenue-lj4jh",
  appId: "1:876856497296:web:cdffbc1e83ac14207e3415",
  apiKey: "AIzaSyDkGMQ4BIVW5cSSjOylJ_oTZxmkEgNFJ7E",
  authDomain: "straight-avenue-lj4jh.firebaseapp.com",
  storageBucket: "straight-avenue-lj4jh.firebasestorage.app",
  messagingSenderId: "876856497296"
};

firebase.initializeApp(firebaseConfig);

let messaging;
try {
  messaging = firebase.messaging();
} catch (err) {
  console.warn('[firebase-messaging-sw.js] Messaging initialization skipped or unsupported in this worker context:', err);
}

// Background push notification event handler
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background push notification:', payload);

    const title = payload.notification?.title || payload.data?.title || 'StudioRef Notification ✨';
    const options = {
      body: payload.notification?.body || payload.data?.body || 'มีอัปเดตไอเดียดีไซน์ใหม่ในระบบ StudioRef',
      icon: payload.notification?.icon || '/icon-192.png',
      badge: '/badge-72.png',
      tag: payload.data?.tag || 'studioref-update',
      data: {
        url: payload.data?.url || payload.fcmOptions?.link || '/',
        ...payload.data
      }
    };

    self.registration.showNotification(title, options);
  });
}

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
