import { JustificationState } from './../../api-types.d';
import { messaging } from '../../plugins/firebase';
import { Getters, Mutations, Actions, Module } from 'vuex-smart-module';
import api from '@/api';

const defaultColors = {
  1: '#bf360c',
  2: '#ff8f00',
  3: '#afb42b',
  4: '#7cb342',
  5: '#43a047',
  default: '#607d8b',
};

export class SettingsState {
  token = localStorage.getItem('fcm_token') || '';
  evaluationColors = Object.assign(
    defaultColors,
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
    return token;
  }
  updateColor({ key, value }) {
    this.state.evaluationColors[key] = value;
    const saved = JSON.parse(localStorage.getItem('colors') || '{}');
    saved[key] = value;
    localStorage.setItem('colors', JSON.stringify(saved));
  }
  resetColors() {
    this.state.evaluationColors = { ...defaultColors };
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
  async saveToken(token: string | boolean) {
    if (!!token) {
      await api.sendToken(token);
      return this.commit('updateToken', token);
    } else {
      await api.deleteToken();
      return this.commit('updateToken', false);
    }
  }
  async getToken() {
    try {
      const token = await messaging.getToken();
      await this.dispatch('saveToken', token);
      return token;
    } catch (err) {
      await this.dispatch('saveToken', false);
      throw err;
    }
  }
  async enable() {
    return await messaging.requestPermission().then(async () => {
      return await this.dispatch('getToken');
    });
  }
  async disable() {
    await messaging.deleteToken(this.state.token);
    await this.dispatch('saveToken', false);
  }
  async toggle() {
    if (this.getters.notificationsEnabled) {
      return await this.dispatch('disable');
    } else {
      return await this.dispatch('enable');
    }
  }
}

export default new Module({
  state: SettingsState,
  getters: SettingsGetters,
  mutations: SettingsMutations,
  actions: SettingsActions,
});
