/* eslint-disable no-console */

workbox.routing.registerRoute(
  new RegExp('/api/.*'),
  new workbox.strategies.NetworkFirst()
);

importScripts('https://www.gstatic.com/firebasejs/7.8.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.2/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: '189077601555',
  appId: '1:189077601555:web:318300dfc3a2d300',
  apiKey: 'AIzaSyBS6oHXLZJJbCeVHTGoX15JhNI_tMuT7Hk',
  projectId: 'efilc-239813'
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[sw.js] Received background message ', payload);

  return self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: '/favicon.ico',
    data: {
      url: payload.data.url
    }
  });
});
self.addEventListener('notificationclick', function(event) {
  const url = event.notification.data.url;
  event.notification.close(); // Android needs explicit close.
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // If so, just focus it.
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
