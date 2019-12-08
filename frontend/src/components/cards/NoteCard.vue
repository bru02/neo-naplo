<template>
  <v-card color="blue-grey" dark @click.native="$emit('input', note)">
      <v-card-title primary-title>
        {{ note.title }}
      </v-card-title>
      <v-card-subtitle>
        <div>{{ note.content }}</div>
        <div class="font-weight-thin">{{ note.teacher }}</div>
      </v-card-subtitle>
    <v-divider light></v-divider>
    <v-card-actions class="pa-3">
      {{ note.type }}
      <v-spacer></v-spacer>
      {{ note.date | formatDate }}
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component
export default class NoteCard extends mixins(Mixin) {
  @Prop() readonly note: any[] | undefined;
}
</script>
