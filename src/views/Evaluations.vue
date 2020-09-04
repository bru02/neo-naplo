<template>
  <v-container>
    <EvaluationsTable
      v-if="!mobile"
      :evaluations="evaluations"
      :groupedClassAverages="groupedClassAverages"
      :groupedEvaluations="groupedEvaluations"
      @input="$router.push(`/evaluations/${$event}`)"
    ></EvaluationsTable>
    <EvaluationsList
      v-else
      :evaluations="evaluations"
      :groupedEvaluations="groupedEvaluations"
      @input="$router.push(`/evaluations/${$event}`)"
    >
    </EvaluationsList>
    <router-view></router-view>
  </v-container>
</template>
<script lang="ts">
import { apiMapper } from '@/store';
import Mixin from '@/mixins';
import EvaluationsTable from '@/components/dataviews/EvaluationsTable.vue';
import EvaluationsList from '@/components/dataviews/EvaluationsList.vue';
import Component, { mixins } from 'vue-class-component';
import { Evaluation } from '../api-types';

@Component({
  computed: apiMapper.mapGetters([
    'evaluations',
    'groupedClassAverages',
    'groupedEvaluations',
  ]),
  components: { EvaluationsTable, EvaluationsList },
  metaInfo: {
    title: 'Jegyek',
  },
})
export default class EvaluationsComponent extends mixins(Mixin) {
  evaluations!: Evaluation[];
  mounted() {
    this.obtain('general');
    this.obtain('classAverages');
  }
}
</script>
