import { messaging } from './plugins/firebase';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(`/sw.js`).then(reg => {
    messaging.useServiceWorker(reg);
  });
}
