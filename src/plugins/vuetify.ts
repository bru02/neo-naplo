import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import { VList } from 'vuetify/es5/components/VList';
import hu from 'vuetify/src/locale/hu';

Vue.use(Vuetify, { components: { VList } });
const storedTheme = localStorage.getItem('dark_theme');

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  lang: {
    locales: { hu },
    current: 'hu',
  },
  theme: {
    dark: storedTheme
      ? storedTheme === 'true'
      : matchMedia && matchMedia('(prefers-color-scheme: dark)').matches,
  },
});
