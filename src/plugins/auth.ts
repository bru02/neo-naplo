import Vue from 'vue';
import VueAuth from '@d0whc3r/vue-auth-plugin';

Vue.use(VueAuth, {
  tokenDefaultName: 'token',
  userDefaultName: 'user',
  tokenStore: ['cookie', 'vuex'],
  headerTokenReplace: '{auth_token}',
  tokenType: 'Bearer',
  loginData: {
    url: '/login',
    redirect: '/',
    method: 'POST',
    customToken(response) {
      return response.data.access_token;
    }
  },
  logoutData: {
    url: '/logout',
    redirect: '/login',
    makeRequest: true
  },
  refreshData: {
    url: '/refresh',
    method: 'POST',
    enabled: true,
    interval: 30
  }
});
