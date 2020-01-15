<template>
  <v-container>
    <v-data-iterator
      disable-pagination
      :group-by="groupBy"
      :sort-by="view"
      sort-desc
      hide-default-footer
      :items="evaluations"
    >
      <template v-slot:default="props">
        <v-list two-line subheader>
          <template
            v-for="(items, header) in props.groupedItems || { '': props.items }"
          >
            <v-subheader inset :key="header" v-if="header"
              >{{ header }}
              <span v-if="groupBy == 'subject'">
                &#10240; &mdash; &#10240;
                <span
                  :class="[`${getEvaluationColor(getAverage(items))}--text`]"
                >
                  {{ getAverage(items) }}</span
                >
              </span>
            </v-subheader>
            <v-lazy
              min-height="50px"
              v-for="item in items"
              :key="item.creatingTime"
            >
              <v-list-item @click="$emit('input', item)">
                <v-list-item-avatar>
                  {{ item.numberValue }}
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="item.subject"></v-list-item-title>
                  <v-list-item-subtitle
                    v-text="item.theme"
                  ></v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-list-item-action-text>
                    {{ formatDate(item.date) }}
                  </v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
            </v-lazy>

            <v-divider inset :key="header + '_div'"></v-divider>
          </template>
        </v-list>
      </template>
    </v-data-iterator>
    <v-bottom-navigation fixed v-model="view" dark shift>
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
  @Prop() readonly groupedEvaluations!: { [k: string]: Evaluation[] };

  view = 'date';
  get groupBy() {
    if (['subject', 'value'].includes(this.view)) return this.view;
    return [];
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
