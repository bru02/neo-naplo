<template>
  <v-container>
    <EvaluationsTable
      v-if="!mobile"
      :evaluations="evaluations"
      :groupedClassAverages="groupedClassAverages"
      :groupedEvaluations="groupedEvaluations"
      v-model="selectedEvaluation"
    ></EvaluationsTable>
    <EvaluationsList
      v-else
      :evaluations="evaluations"
      :groupedEvaluations="groupedEvaluations"
      v-model="selectedEvaluation"
    >
    </EvaluationsList>
    <DataViewer
      title="Értékelés"
      :fn="evalValues"
      v-model="selectedEvaluation"
    ></DataViewer>
  </v-container>
</template>
<script lang="ts">
import { apiMapper } from '@/store';
import Mixin from '@/mixins';
import EvaluationsTable from '@/components/dataviews/EvaluationsTable.vue';
import EvaluationsList from '@/components/dataviews/EvaluationsList.vue';
import DataViewer from '@/components/DataViewer.vue';
import Component, { mixins } from 'vue-class-component';
import { Evaluation } from '../api-types';
@Component({
  computed: apiMapper.mapGetters([
    'evaluations',
    'groupedClassAverages',
    'groupedEvaluations'
  ]),
  components: { EvaluationsTable, EvaluationsList, DataViewer }
})
export default class EvaluationsComponent extends mixins(Mixin) {
  name = 'Jegyek';
  selectedEvaluation: Evaluation | boolean = false;
  mounted() {
    this.obtain('general');
  }
  metaInfo = {
    title: 'Jegyek'
  };
}
</script>
