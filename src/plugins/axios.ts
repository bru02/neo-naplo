import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';

// @ts-ignore: Biztosan van base element
axios.defaults.baseURL = `${location.protocol}//${location.host}/api`; ///eFilc/public/api' //document.querySelector('base').href + 'api';

Vue.use(VueAxios, axios);
