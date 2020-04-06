import Vue from 'vue';
import './registerServiceWorker';
import store from './store';
import router from './plugins/router';
import vuetify from './plugins/vuetify';
import './plugins/axios';
import './plugins/sentry';
import './plugins/firebase';
import '@mdi/font/css/materialdesignicons.css';

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
            (this.$store.getters['auth/tokenData'].exp ?? Infinity) - 240 <=
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
          const instituteCode = this.$store.state.api.general.data
            ?.instituteCode;
          if (this.$store.getters['auth/isAuthenticated']) {
            this.$store.dispatch('auth/logout');
          }
          if (this.$route.name != 'Belépés') {
            this.$router.push({
              name: `Belépés`,
              query: { school: instituteCode }
            });
          }
        }
        throw error;
      }
    );
    this.$router.beforeEach((to, from, next) => {
      const routes = to.matched
        .filter(url => url.name !== 'Belépés')
        .filter(match => 'auth' in match.meta)
        .filter(meta => !!meta);
      if (routes && routes.length) {
        if (
          this.$store.getters['auth/isAuthenticated'] ||
          to.name == 'Belépés'
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

import * as helpers from './helpers';
for (const [name, helper] of Object.entries(helpers)) {
  Vue.filter(name, helper);
}
