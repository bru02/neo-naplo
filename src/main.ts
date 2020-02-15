import Vue from 'vue';
import store from './store';
import router from './plugins/router';
import vuetify from './plugins/vuetify';
import './plugins/axios';
import '@mdi/font/css/materialdesignicons.css';
import './registerServiceWorker';
import App from './App.vue';

let refreshTokenPromise: Promise<string> | null = null;

export default new Vue({
  el: '#app',
  store,
  router,
  // @ts-ignore
  vuetify,
  render: h => h(App),
  async created() {
    Vue.axios.interceptors.request.use(
      async (config = {}) => {
        if (this.$store.getters['auth/isAuthenticated']) {
          let token = this.$store.state.auth.token;
          if (
            this.$store.getters['auth/tokenData'].exp - 240 <=
              Date.now() / 1000 &&
            config.url != '/refresh' &&
            config.url != '/logout'
          ) {
            token = await (refreshTokenPromise ||
              (refreshTokenPromise = this.$store.dispatch(
                'auth/refreshToken'
              )));
            refreshTokenPromise = null;
          }
          config.headers['authorization'] = `bearer ${token}`;
        }
        return config;
      },
      function(error) {
        return Promise.reject(error);
      }
    );
    Vue.axios.interceptors.response.use(
      response => {
        return response;
      },
      (error: any) => {
        const status = error?.response?.status;
        if (status === 401) {
          if (this.$store.getters['auth/isAuthenticated']) {
            this.$store.dispatch('auth/logout');
          }
          if (this.$route.fullPath != '/login') {
            this.$router.push('/login');
          }
        }
        throw error;
      }
    );
    this.$router.beforeEach((to, from, next) => {
      const routes = to.matched
        .filter(url => url.path !== 'login')
        .filter(match => 'auth' in match.meta)
        .filter(meta => !!meta);
      if (routes && routes.length) {
        if (
          this.$store.getters['auth/isAuthenticated'] ||
          to.fullPath == '/login'
        ) {
          next();
        } else {
          next('/login');
        }
      } else {
        next();
      }
    });
  }
});

import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';

if (
  process.env.NODE_ENV === 'production' &&
  process.env.VUE_APP_SENTRY_LARAVEL_DSN
) {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_LARAVEL_DSN,
    integrations: [new VueIntegration({ Vue, attachProps: true })],
    release: 'filc@' + process.env.VUE_APP_SHA
  });
}

import * as helpers from './helpers';
for (const [name, helper] of Object.entries(helpers)) {
  Vue.filter(name, helper);
}
