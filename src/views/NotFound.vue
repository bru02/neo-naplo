<template>
  <v-container>taka vissza itten nincs semmi</v-container>
</template>
<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Mixin from '@/mixins';
@Component
export default class NotFoundComponent extends mixins(Mixin) {
  name = '404';
  metaInfo = {
    title: '404'
  };
}
</script>
