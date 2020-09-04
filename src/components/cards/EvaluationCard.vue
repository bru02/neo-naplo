<template>
  <v-card
    :color="getEvaluationColor(evaluation.numberValue)"
    :dark="dark"
    @click.native="$emit('input', evaluation.id)"
  >
    <div class="d-flex flex-no-wrap">
      <v-avatar class="ma-3" size="auto" tile>
        <h1
          :class="[
            'display-1',
            `font-weight-${
              evaluation.weight === '100%'
                ? 'regular'
                : evaluation.weight === '50%'
                ? 'thin'
                : 'bold'
            }`,
          ]"
        >
          {{ evaluation.numberValue }}
        </h1>
      </v-avatar>
      <div>
        <v-card-title primary-title>
          <v-icon :dark="dark">{{
            getSubjectIcon(evaluation.subjectCategoryName)
          }}</v-icon
          >&#10240;{{ evaluation.subject }}
        </v-card-title>
        <v-card-subtitle>
          <div>{{ evaluation.theme }}</div>
          <div class="font-weight-thin">{{ evaluation.teacher }}</div>
        </v-card-subtitle>
      </div>
    </div>

    <v-divider light></v-divider>
    <v-card-actions class="pa-3">
      <v-icon :dark="dark">{{ getEvaluationIcon(evaluation.mode) }}</v-icon
      >&#10240;{{
        evaluation.type === 'MidYear' ? evaluation.mode : evaluation.typeName
      }}
      <v-spacer></v-spacer>
      {{ evaluation.date | formatDate }}
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Evaluation } from '../../api-types';
import { isDark } from '../../helpers';

@Component
export default class EvaluationCard extends mixins(Mixin) {
  @Prop() readonly evaluation!: Evaluation;
  get dark() {
    return isDark(this.getEvaluationColor(+this.evaluation.numberValue));
  }
}
</script>
