import { Store } from 'vuex';
import {
  Getters,
  Mutations,
  Actions,
  Module,
  Context
} from 'vuex-smart-module';
import api from '@/api';
import apiModule from './api';

export class AuthState {
  token = localStorage.getItem('token') || '';
}

class AuthGetters extends Getters<AuthState> {
  get tokenData() {
    const { token } = this.state;
    return token && JSON.parse(atob(token.split('.')[1]));
  }
  get isAuthenticated() {
    return !!this.state.token;
  }
}

class AuthMutations extends Mutations<AuthState> {
  updateToken(token: string) {
    this.state.token = token;
    localStorage.setItem('token', token);
  }
}

class AuthActions extends Actions<
  AuthState,
  AuthGetters,
  AuthMutations,
  AuthActions
> {
  api!: Context<typeof apiModule>;
  $init(store: Store<any>): void {
    // Create and retain foo module context
    this.api = apiModule.context(store);
  }
  async login({ username, password, school, rme }) {
    return api
      .login(username, password, school, rme)
      .then(res => {
        if (res.data && res.data.access_token) {
          this.commit('updateToken', res.data.access_token);
          return res;
        }
        console.log(res);
      })
      .catch(e => {
        throw e;
      });
  }
  async logout() {
    api.logout().then(() => {
      this.commit('updateToken', '');
    });

    this.api.commit('reset');
  }
  async refreshToken(): Promise<any> {
    const res = await api.refresh();
    // debugger;
    if (res.data.access_token) {
      this.commit('updateToken', res.data.access_token);
      return res.data.access_token;
    }
    return Promise.reject('No tokens supplied');
  }
}

export default new Module({
  state: AuthState,
  getters: AuthGetters,
  mutations: AuthMutations,
  actions: AuthActions
});
