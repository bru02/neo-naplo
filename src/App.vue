<template>
  <v-app id="app">
    <v-navigation-drawer fixed app v-model="drawer">
      <v-list dense>
        <v-list-item v-for="(link, i) in links" :to="link.link" :key="i">
          <v-list-item-action>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ link.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-action>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title> Kilépés </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      color="indigo darken-2"
      dark
      dense
      app
      v-show="isAuthenticated"
      extension-height="0"
      overflow
      extended
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ this.$router.currentRoute.name }}</v-toolbar-title>
      <template v-slot:extension>
        <v-progress-linear
          :active="loading > 0"
          color="light-blue"
          :indeterminate="true"
          absolute
          bottom
        ></v-progress-linear>
      </template>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
    <Toast />
  </v-app>
</template>
<script lang="ts">
import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { authMapper } from '@/store';
import { AxiosError } from 'axios';
import { getWeek } from './utils/evaluations';
import { apiClient } from './plugins/axios';
import Toast from './components/Toast.vue';
import { toast } from './plugins/toasts';
import { fromCache } from './utils';

@Component({
  computed: authMapper.mapGetters(['isAuthenticated']),
  metaInfo: {
    title: '...',
    titleTemplate: '%s | Neo Napló',
  },
  components: {
    Toast,
  },
})
export default class App extends mixins(Mixin) {
  drawer = false;
  loading = 0;

  links = [
    { name: 'Faliújság', icon: 'mdi-home', link: '/' },
    { name: 'Hiányzások', icon: 'mdi-block-helper', link: '/absences' },
    {
      name: 'Feljegyzések',
      icon: 'mdi-comment-processing-outline',
      link: '/notes',
    },
    {
      name: 'Órarend',
      icon: 'mdi-calendar-text-outline',
      link: '/timetable',
    },
    {
      name: 'Jegyek',
      icon: 'mdi-calendar-check-outline',
      link: '/evaluations',
    },
    {
      name: 'Statisztikák',
      icon: 'mdi-chart-timeline-variant',
      link: '/statistics',
    },

    {
      name: 'Számonkérések',
      icon: 'mdi-file-document-edit-outline',
      link: '/exams',
    },
    { name: 'Profil', icon: 'mdi-account', link: '/profile' },
    { name: 'Beállítások', icon: 'mdi-cog', link: '/settings' },
  ];

  async created() {
    apiClient.interceptors.request.use((config = {}) => {
      this.loading++;
      return config;
    });
    apiClient.interceptors.response.use(
      (res) => {
        this.loading--;
        return res;
      },
      (error: AxiosError) => {
        this.loading--;
        const response = error?.response;
        switch (response?.status) {
          case 424:
            toast.error('KRÉTA éppen frissít', {
              icon: 'mdi-sync-alert',
            });
            break;
          case 401:
            toast.error('Azonosítási hiba', {
              icon: 'mdi-account-alert',
            });
            break;
          case 500:
            toast.error('Belső hiba', {
              icon: 'mdi-wrench',
            });
            break;
          default:
            toast.error('Hálózati hiba', {
              icon: 'mdi-wifi-off',
            });
            break;
        }
        const data = response?.data;
        if (
          data &&
          process.env.NODE_ENV === 'production' &&
          process.env.VUE_APP_SENTRY_LARAVEL_DSN
        ) {
          Sentry.setExtra('response_data', data);
        }
        throw error;
      }
    );
    if (this.$store.getters['auth/isAuthenticated'] && 'caches' in window) {
      for (const key of ['general', 'events', 'classAverages']) {
        const data = await fromCache(key);
        if (!data) continue;
        this.$store.commit(
          `api/update${key[0].toUpperCase() + key.substr(1)}`,
          data
        );
      }

      const w = getWeek(0);
      const data = await fromCache(`timetable?from=${w.from}&to=${w.to}`);
      if (data) {
        this.$store.state.api.timetable[`${w.from}-${w.to}`] = {};
        Vue.set(this.$store.state.api.timetable, `${w.from}-${w.to}`, {
          data,
          loading: false,
          loaded: true,
        });
      }
    } else if (this.$route.name !== 'Belépés') {
      this.$router.push('/login');
    }
  }

  logout() {
    this.drawer = false;
    this.$store.dispatch('auth/logout');
    this.$router.push('/login');
  }
}
</script>
<style>
.v-list-item__title,
.v-list-item__subtitle {
  text-overflow: clip;
  white-space: normal;
}
.v-bottom-navigation {
  overflow-y: auto;
}
.v-application {
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
