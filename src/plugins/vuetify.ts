import Vue from 'vue';
// eslint-disable-next-line
import Vuetify from "vuetify/lib/framework";
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

import hu from 'vuetify/src/locale/hu';
import en from 'vuetify/src/locale/en';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi'
  },
  lang: {
    locales: { hu, en },
    current: 'hu'
  }
});
