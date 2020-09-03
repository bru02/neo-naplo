<template>
  <v-container>
    <v-list>
      <v-list-item
        v-for="note in notes"
        :key="note.id"
        :to="`/notes/${note.id}`"
      >
        <v-list-item-content>
          <v-list-item-title>{{ note.title }}</v-list-item-title>
          <v-list-item-subtitle>
            <span class="text--primary">{{ note.teacher }}</span> &mdash;
            {{ trimText(note.content) }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-list-item-action-text>
            {{ note.date | formatDate }}
          </v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-alert value type="info" v-show="notes.length === 0 && !loading"
      >Még nincs feljegyzésed</v-alert
    >
    <router-view></router-view>
  </v-container>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import { apiMapper } from '@/store';
import Component, { mixins } from 'vue-class-component';
import { Note } from '../api-types';

@Component({
  computed: apiMapper.mapState({
    notes: state => state.general.data.notes,
    loading: state => state.general.loading
  }),
  metaInfo: {
    title: 'Feljegyzések'
  }
})
export default class NotesComponent extends mixins(Mixin) {
  notes!: Note[];
  headers = [
    {
      text: 'Dátum',
      align: 'left',
      value: 'date'
    },
    { text: 'Típus', value: 'title' },
    { text: 'Tanár', value: 'teacher' },
    { text: 'Üzenet', value: 'content' }
  ];
  mounted() {
    this.obtain('general');
  }
}
</script>
