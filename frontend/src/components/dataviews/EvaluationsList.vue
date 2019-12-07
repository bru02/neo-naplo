<template>
  <v-container>
    <v-list two-line subheader>
      <template v-for="(items, header) in sorted">
        <v-subheader inset :key="header" v-if="!!header"
          >{{ header
          }}<span
            v-show="sortBy == 'subject'"
            :class="[`${getEvaluationColor(getAverage(items))}--text`]"
          ></span
        ></v-subheader>
        <v-list-item
          v-for="item in items"
          :key="item.creatingTime"
          @click="$emit('input', item)"
        >
          <v-list-item-avatar>
            {{ item.numberValue }}
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-text="item.subject"></v-list-item-title>
            <v-list-item-subtitle v-text="item.theme"></v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            {{ formatDate(item.date) }}
          </v-list-item-action>
        </v-list-item>

        <v-divider inset :key="header + '_div'"></v-divider>
      </template>
    </v-list>
    <v-bottom-navigation fixed v-model="sortBy" dark shift>
      <v-btn v-for="flag in sortFlags" :key="flag.id" :value="flag.id">
        <span>{{ flag.text }}</span>
        <v-icon>{{ flag.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-container>
</template>

<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Evaluation, ClassAverage } from '../../api-types';
@Component
export default class EvaluationList extends mixins(Mixin) {
  @Prop() readonly evaluations!: Evaluation[];
  groupedEvaluations!: { [k: string]: Evaluation[] };

  sortBy = 'date';
  get sorted() {
    switch (this.sortBy) {
      case 'date':
        return {
          '': this.evaluations.sort((a, b) => b.date - a.date)
        };
      case 'creatingTime':
        return {
          '': this.evaluations.sort((a, b) => b.creatingTime - a.creatingTime)
        };
      case 'value':
        return this.group(this.evaluations, 'value');
      case 'subject':
      default:
        return this.groupedEvaluations;
    }
  }
  sortFlags = [
    {
      id: 'date',
      text: 'Dátum',
      icon: 'mdi-timeline-text'
    },
    {
      id: 'creatingTime',
      text: 'Beírás',
      icon: 'mdi-timeline-plus'
    },
    {
      id: 'subject',
      text: 'Tárgy',
      icon: 'mdi-format-list-bulleted-square'
    },
    {
      id: 'value',
      text: 'Értékelés',
      icon: 'mdi-format-list-bulleted-type'
    }
  ];
}
</script>
