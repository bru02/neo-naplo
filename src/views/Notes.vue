<template>
  <v-container>
    <v-list v-if="mobile">
      <v-list-item
        v-for="note in notes"
        :key="note.id"
        @click="selectedNote = note"
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
    <v-data-table
      :headers="headers"
      :items="notes"
      :loading="loading"
      disable-pagination
      must-sort
      sort-by="date"
      sort-desc
      hide-default-footer
      class="elevation-1"
      @click:row="selectedNote = $event"
      v-else
    >
      <template v-slot:no-data>
        <v-alert :value="true" type="info">
          Még Nincsenek feljegyzéseid
        </v-alert>
      </template>
      <template v-slot:item.title="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <span v-on="on">{{ item.title }}</span>
          </template>
          <span>{{ item.type }}</span>
        </v-tooltip>
      </template>
      <template v-slot:item.content="{ item }">
        {{ trimText(item.content) }}
      </template>
      <template v-slot:item.date="{ item }">
        {{ formatDate(item.date) }}
      </template>
    </v-data-table>
    <DataViewer title="Feljegyzés" :fn="noteValues" v-model="selectedNote" />
  </v-container>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import { apiMapper } from '@/store';
import Component, { mixins } from 'vue-class-component';
import { Note } from '../api-types';
import DataViewer from '@/components/dialogs/DataViewer.vue';
import { Watch } from 'vue-property-decorator';

@Component({
  computed: apiMapper.mapState({
    notes: state => state.general.data.notes,
    loading: state => state.general.loading
  }),
  components: { DataViewer },
  metaInfo: {
    title: 'Feljegyzések'
  }
})
export default class NotesComponent extends mixins(Mixin) {
  selectedNote: Note | boolean = false;
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
  @Watch('selectedNote')
  onselectedNoteChange(value) {
    if (value) {
      if (!this.$route.params.id) this.$router.push(`/notes/${value.id}`);
    } else {
      if (this.$route.params.id) this.$router.push(`/notes`);
    }
  }
  @Watch('$route')
  onRouteChange() {
    const { id } = this.$route.params;
    if (id) {
      if (!this.selectedNote)
        this.selectedNote = this.notes.find(e => e.id === +id) ?? false;
    } else {
      this.selectedNote = false;
    }
  }
}
</script>
