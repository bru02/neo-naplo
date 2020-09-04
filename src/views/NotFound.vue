<template>
  <v-container
    class="text-center"
    fill-height
    style="height: calc(100vh - 58px);"
  >
    <v-row align="center">
      <v-col>
        <h1 class="display-2 primary--text">Hoppá, 404</h1>

        <p>Ez az oldal nem létezik</p>

        <v-btn to="/" color="primary" outlined>
          Faliújság
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Mixin from '@/mixins';
@Component({
  metaInfo: {
    title: '404',
  },
})
export default class NotFoundComponent extends mixins(Mixin) {}
</script>
