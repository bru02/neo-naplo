<template>
  <v-container>
    <v-list>
      <v-list-item
        v-for="exam in exams"
        :key="exam.id"
        @click="selectedExam = exam"
      >
        <v-list-item-content>
          <v-list-item-title>{{ exam.name }}</v-list-item-title>
          <v-list-item-subtitle>
            <span class="text--primary">{{ exam.subject }}</span> &mdash;
            {{ exam.type }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-list-item-action-text>
            {{ exam.date | formatDate }}, {{ exam.count }}. óra
          </v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <DataViewer title="Számonkérés" :fn="examValues" v-model="selectedExam" />
  </v-container>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import { apiMapper } from '@/store';
import Component, { mixins } from 'vue-class-component';
import { Exam } from '../api-types';
import DataViewer from '@/components/dialogs/DataViewer.vue';
import { Watch } from 'vue-property-decorator';

@Component({
  computed: apiMapper.mapState({
    notes: state => state.exams.data,
    loading: state => state.exams.loading
  }),
  components: { DataViewer },
  metaInfo: {
    title: 'Számonkérések'
  }
})
export default class ExamsComponent extends mixins(Mixin) {
  selectedExam: Exam | boolean = false;
  exams!: Exam[];
  mounted() {
    this.obtain('exams');
  }
  @Watch('selectedExam')
  onselectedNoteChange(value) {
    if (value) {
      if (!this.$route.params.id) this.$router.push(`/exams/${value.id}`);
    } else {
      if (this.$route.params.id) this.$router.push(`/exams`);
    }
  }
  @Watch('$route')
  onRouteChange() {
    const { id } = this.$route.params;
    if (id) {
      if (!this.selectedExam)
        this.selectedExam = this.exams.find(e => e.id === +id) ?? false;
    } else {
      this.selectedExam = false;
    }
  }
}
</script>
