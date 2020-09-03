import store from '@/store';
import { ToastOptions } from './../store/modules/toasts';
import Vue from 'vue';
import VBtn from 'vuetify/lib/components/VBtn';

interface PromptOptions extends ToastOptions {
  confirm: string;
  decline?: string | boolean;
}

Vue.use(() => {
  const createElement = new Vue({ components: { VBtn } }).$createElement;
  Vue.prototype.$toast = function(msg: string, opts: ToastOptions) {
    store.dispatch('toasts/show', { msg, ...opts });
  };
  const basicColors = ['info', 'success', 'warning', 'error'];
  for (const color of basicColors) {
    Vue.prototype.$toast[color] = function(msg: string, opts: ToastOptions) {
      store.dispatch('toasts/show', { msg, ...opts, color });
    };
  }
  Vue.prototype.$toast.prompt = function(msg: string, opts: PromptOptions) {
    return new Promise((resolve, reject) => {
      let resolved = false;
      store.dispatch('toasts/show', {
        msg,
        ...opts,
        queueable: false,
        onClose: () => {
          if (!resolved) reject();
        },
        slot: [
          createElement(
            'v-btn',
            {
              on: {
                click: () => {
                  resolved = true;
                  resolve();
                }
              },
              props: {
                text: true
              }
            },
            [opts.confirm]
          )
        ],
        closeText: opts.decline
      });
    });
  };
});

export const toast = Vue.prototype.$toast;
