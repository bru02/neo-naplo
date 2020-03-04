<template>
  <v-container>taka vissza itten nincs semmi</v-container>
</template>
<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Mixin from '@/mixins';
@Component({
  metaInfo: {
    title: '404'
  }
})
export default class NotFoundComponent extends mixins(Mixin) {}
</script>
