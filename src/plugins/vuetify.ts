import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

import hu from 'vuetify/src/locale/hu';
import en from 'vuetify/src/locale/en';

Vue.use(Vuetify);
const storedTheme = localStorage.getItem('dark_theme');

export default new Vuetify({
  icons: {
    iconfont: 'mdi'
  },
  lang: {
    locales: { hu, en },
    current: 'hu'
  },
  theme: {
    dark: storedTheme
      ? storedTheme === 'true'
      : matchMedia && matchMedia('(prefers-color-scheme: dark)').matches
  }
});
