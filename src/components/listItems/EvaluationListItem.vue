<template>
  <v-list-item @click="$emit('input', eval)">
    <v-list-item-avatar>
      <v-avatar :color="getEvaluationColor(eval.numberValue)">
        <span :class="classes">{{ eval.numberValue || '...' }} </span>
      </v-avatar>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title>{{ eval.subject }}</v-list-item-title>
      <v-list-item-subtitle>
        <span v-if="eval.type != 'MidYear'"
          >{{ eval.typeName }} {{ eval.theme && '-' }}</span
        >
        {{ eval.theme }}
      </v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action>
      <slot name="action">
        <v-list-item-action-text>
          {{ eval.date | formatDate }}
        </v-list-item-action-text>
      </slot>
    </v-list-item-action>
  </v-list-item>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Evaluation } from '../../api-types';
import { isDark } from '../../helpers';

@Component
export default class EvaluationListItem extends mixins(Mixin) {
  @Prop() readonly eval!: Evaluation;
  get classes() {
    return {
      'white--text': isDark(this.getEvaluationColor(+this.eval.numberValue)),
      [`font-weight-${
        this.eval.weight === '100%'
          ? 'regular'
          : this.eval.weight === '50%'
          ? 'thin'
          : 'bold'
      }`]: true
    };
  }
}
</script>
