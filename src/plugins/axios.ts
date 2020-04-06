import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';

axios.defaults.baseURL = `${location.protocol}//${location.host}/api`;

Vue.use(VueAxios, axios);
