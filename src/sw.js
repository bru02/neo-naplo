/* eslint-disable no-console */
import { registerRoute } from 'workbox-routing';
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { precacheAndRoute } from 'workbox-precaching';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import * as googleAnalytics from 'workbox-google-analytics';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  new RegExp('/api/.*'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

googleAnalytics.initialize();

addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    skipWaiting();
  }
});

importScripts('https://www.gstatic.com/firebasejs/7.8.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.2/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: '189077601555',
  appId: '1:189077601555:web:318300dfc3a2d300',
  apiKey: 'AIzaSyBS6oHXLZJJbCeVHTGoX15JhNI_tMuT7Hk',
  projectId: 'efilc-239813',
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[sw.js] Received background message ', payload);

  return self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: '/favicon.ico',
    data: {
      url: payload.data.url,
    },
  });
});

self.addEventListener('notificationclick', function (event) {
  const url = event.notification.data.url;
  event.notification.close(); // Android needs explicit close.
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
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
