import { Workbox, messageSW } from 'workbox-window';
import { messaging } from './plugins/firebase';
import { toast } from './plugins/toasts';

if ('serviceWorker' in navigator) {
  registerSW();
}

async function registerSW() {
  const wb = new Workbox('/sw.js');
  let registration;
  const showSkipWaitingPrompt = event => {
    // `event.wasWaitingBeforeRegister` will be false if this is
    // the first time the updated service worker is waiting.
    // When `event.wasWaitingBeforeRegister` is true, a previously
    // updated service worker is still waiting.
    // You may want to customize the UI prompt accordingly.

    toast
      .prompt('Elérhető egy új verzió', {
        confirm: 'Frissítés'
      })
      .then(async () => {
        // Assuming the user accepted the update, set up a listener
        // that will reload the page as soon as the previously waiting
        // service worker has taken control.
        wb.addEventListener('controlling', () => {
          window.location.reload();
        });

        if (registration && registration.waiting) {
          // Send a message to the waiting service worker,
          // instructing it to activate.
          // Note: for this to work, you have to add a message
          // listener in your service worker. See below.
          messageSW(registration.waiting, { type: 'SKIP_WAITING' });
        }
      });
  };

  wb.addEventListener('waiting', showSkipWaitingPrompt);
  wb.addEventListener('externalwaiting', showSkipWaitingPrompt);

  registration = await wb.register();
  registration && messaging.useServiceWorker(registration);
}
