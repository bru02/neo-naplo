import Vue from 'vue';
import Vuex from 'vuex';
import { createStore, Module, createMapper } from 'vuex-smart-module';
import api from './modules/api';
import auth from './modules/auth';
import time from './modules/time';

Vue.use(Vuex);
const root = new Module({
  modules: {
    api,
    auth,
    time
  }
});
export default createStore(root);
export const apiMapper = createMapper(api);
export const authMapper = createMapper(auth);
export const timeMapper = createMapper(time);
