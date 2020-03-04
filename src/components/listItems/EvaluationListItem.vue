<template>
  <v-list-item @click="$emit('input', eval)">
    <v-list-item-avatar>
      <v-avatar :color="getEvaluationColor(eval.numberValue)">
        <span :class="classes">{{ eval.numberValue || '...' }} </span>
      </v-avatar>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title v-text="eval.subject"></v-list-item-title>
      <v-list-item-subtitle v-text="eval.theme"></v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action>
      <v-list-item-action-text>
        {{ formatDate(eval.date) }}
      </v-list-item-action-text>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Watch, Prop } from 'vue-property-decorator';
import { Evaluation } from '../../api-types';

@Component
export default class EvaluationListItem extends mixins(Mixin) {
  @Prop() readonly eval!: Evaluation;
  get classes() {
    return {
      'white--text': this.isDark(
        this.getEvaluationColor(+this.eval.numberValue)
      ),
      [`font-weight-${
        this.eval.weight == '100%'
          ? 'regular'
          : this.eval.weight == '50%'
          ? 'thin'
          : 'bold'
      }`]: true
    };
  }
}
</script>
