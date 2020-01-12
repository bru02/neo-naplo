import Vue from 'vue';
import store from './store';
import router from './plugins/router';
import vuetify from './plugins/vuetify';
import './plugins/axios';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';

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
            config.url != '/refresh'
          ) {
            token = await this.$store.dispatch('auth/refreshToken');
          }
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      function(error) {
        return Promise.reject(error);
      }
    );
    Vue.axios.interceptors.response.use(
      response => {
        //console.log(response);
        return response;
      },
      (error: any) => {
        const status = error && error.response && error.response.status;
        if (status === 401) {
          if (this.$store.getters['auth/isAuthenticated']) {
            this.$store.dispatch('auth/logout');
          }
          if (this.$route.fullPath != '/login') {
            this.$router.push('/login');
          }
        }
        return Promise.reject(error);
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

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_LARAVEL_DSN) {
  import(
    /* webpackChunkName: "insights" */
    /* webpackPrefetch: true */
    './insights'
  );
}

import * as helpers from './helpers';
for (const [name, helper] of Object.entries(helpers)) {
  Vue.filter(name, helper);
}