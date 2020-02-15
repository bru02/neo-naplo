<template>
  <v-card color="blue lighten-1" dark @click.native="$emit('input', event)">
    <v-card-title primary-title>
      {{ event.title }}
    </v-card-title>
    <v-card-subtitle>
      <div>{{ event.content }}</div>
      <div class="font-weight-thin">{{ event.teacher }}</div>
    </v-card-subtitle>
    <v-divider light></v-divider>
    <v-card-actions class="pa-3">
      Faliújság
      <v-spacer></v-spacer>
      {{ event.date | formatDate }}
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component
export default class EventCard extends mixins(Mixin) {
  @Prop() readonly event: any[] | undefined;
}
</script>
