import { messaging } from '../../plugins/firebase';
import { Getters, Mutations, Actions, Module } from 'vuex-smart-module';
import api from '@/api';

export class SettingsState {
  token = localStorage.getItem('fcm_token') || '';
  evaluationColors = Object.assign(
    {
      1: '#bf360c',
      2: '#ff8f00',
      3: '#afb42b',
      4: '#7cb342',
      5: '#43a047',
      default: '#607d8b'
    },
    JSON.parse(localStorage.getItem('colors') || '{}')
  );
}

class SettingsGetters extends Getters<SettingsState> {
  get notificationsEnabled() {
    return !!this.state.token;
  }
}

class SettingsMutations extends Mutations<SettingsState> {
  updateToken(token: string | boolean) {
    this.state.token = token ? token + '' : '';
    localStorage.setItem('fcm_token', this.state.token);
    if (!!token) {
      api.sendToken(token);
    } else {
      api.deleteToken();
    }
  }
  updateColor({ key, value }) {
    this.state.evaluationColors[key] = value;
    const saved = JSON.parse(localStorage.getItem('colors') || '{}');
    saved[key] = value;
    localStorage.setItem('colors', JSON.stringify(saved));
  }
  resetColors() {
    this.state.evaluationColors = {
      1: '#bf360c',
      2: '#ff8f00',
      3: '#afb42b',
      4: '#7cb342',
      5: '#43a047',
      default: '#607d8b'
    };
    localStorage.setItem('colors', '');
  }
}

class SettingsActions extends Actions<
  SettingsState,
  SettingsGetters,
  SettingsMutations,
  SettingsActions
> {
  $init() {
    if (this.getters.notificationsEnabled) this.enable();
    messaging.onTokenRefresh(() => {
      this.getToken();
    });
  }
  async getToken() {
    messaging
      .getToken()
      .then(token => {
        this.mutations.updateToken(token);
        return token;
      })
      .catch(err => {
        this.mutations.updateToken(false);
        throw err;
      });
  }
  async enable() {
    return await messaging.requestPermission().then(() => {
      return this.dispatch('getToken');
    });
  }
  async disable() {
    return await messaging
      .deleteToken(this.state.token)
      .then(() => {
        this.mutations.updateToken(false);
        return true;
      })
      .catch(err => {
        throw err;
      });
  }
  async toggle() {
    if (this.getters.notificationsEnabled) {
      await this.dispatch('disable');
    } else {
      await this.dispatch('enable');
    }
  }
}

export default new Module({
  state: SettingsState,
  getters: SettingsGetters,
  mutations: SettingsMutations,
  actions: SettingsActions
});
