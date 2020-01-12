<template>
  <v-app id="app">
    <v-navigation-drawer fixed app v-model="drawer">
      <v-list dense>
        <v-list-item
          v-for="(item, i) in this.routes"
          v-show="item.meta ? item.meta.auth == isAuthenticated : !!item.name"
          :to="
            item.name == 'Órarend'
              ? '/timetable'
              : item.name == 'Statisztikák'
              ? '/statistics'
              : item.path
          "
          :key="i"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          @click="$store.dispatch('auth/logout'), $router.push('/login')"
        >
          <v-list-item-action>
            <v-icon>mdi-logout-variant</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              Kilépés
            </v-list-item-title>
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
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import { routes } from '@/plugins/router';
import Component, { mixins } from 'vue-class-component';
import { formatDate } from './helpers';
import { authMapper } from '@/store';
@Component({
  computed: authMapper.mapGetters(['isAuthenticated'])
})
export default class App extends mixins(Mixin) {
  drawer = false;
  routes = routes;
  loading = 0;
  async created() {
    this.$http.interceptors.request.use((config = {}) => {
      this.loading++;
      return config;
    });
    this.$http.interceptors.response.use(
      res => {
        this.loading--;
        return res;
      },
      (error: any) => {
        this.loading--;
      }
    );
    if (this.$store.getters['auth/isAuthenticated']) {
      const w = this.getWeek(0);
      for (const key in ['general', `timetable?from=${w.from}&to=${w.to}`]) {
        const cachedResponse = await caches.match(`/api/${key}`);
        let a = key.split('?')[0];
        if (cachedResponse)
          this.$store.dispatch(
            `update${a[0].toUpperCase() + a.substr(1)}`,
            cachedResponse
          );
      }
    } else if (this.$route.fullPath != '/login') {
      this.$router.push('/login');
    }
  }
  metaInfo = {
    title: '...',
    titleTemplate: '%s | Filc Napló'
  };
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
</style>
