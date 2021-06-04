import { Mutations, Module } from 'vuex-smart-module';

const defaultColors = {
  1: '#bf360c',
  2: '#ff8f00',
  3: '#afb42b',
  4: '#7cb342',
  5: '#43a047',
  default: '#607d8b',
};

export class SettingsState {
  evaluationColors = Object.assign(
    defaultColors,
    JSON.parse(localStorage.getItem('colors') || '{}')
  );
}

class SettingsMutations extends Mutations<SettingsState> {
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

export default new Module({
  state: SettingsState,
  mutations: SettingsMutations,
});
