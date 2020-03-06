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
import { Watch } from 'vue-property-decorator';

@Component({
  computed: apiMapper.mapGetters([
    'evaluations',
    'groupedClassAverages',
    'groupedEvaluations'
  ]),
  components: { EvaluationsTable, EvaluationsList, DataViewer },
  metaInfo: {
    title: 'Jegyek'
  }
})
export default class EvaluationsComponent extends mixins(Mixin) {
  selectedEvaluation: Evaluation | boolean = false;
  evaluations!: Evaluation[];
  mounted() {
    this.obtain('general');
    this.obtain('classAverages');
  }
  @Watch('selectedEvaluation')
  onselectedEvalChange(value) {
    if (value) {
      if (!this.$route.params.id) this.$router.push(`/evaluations/${value.id}`);
    } else {
      if (this.$route.params.id) this.$router.push(`/evaluations`);
    }
  }
  @Watch('$route')
  onRouteChange() {
    const { id } = this.$route.params;
    if (id) {
      this.selectedEvaluation =
        this.evaluations.find(e => e.id === +id) ?? false;
    } else {
      this.selectedEvaluation = false;
    }
  }
}
</script>
