<template>
  <v-container>
    <v-data-iterator
      disable-pagination
      :sort-by="view.slice(5)"
      v-show="view.slice(0, 4) == 'sort'"
      sort-desc
      hide-default-footer
      :items="evaluationsByType.MidYear"
    >
      <template v-slot:default="props">
        <v-list two-line subheader>
          <template v-for="(item, i) in props.items">
            <v-subheader
              v-if="
                view == 'sort:subject' &&
                  (i == 0 || props.items[i - 1].subject != item.subject)
              "
              :key="item.subject"
              >{{ item.subject }} &#10240; &mdash; &#10240;
              <span
                :class="[
                  `${getEvaluationColor(
                    getAverage(groupedEvaluations[item.subject])
                  )}--text`
                ]"
              >
                {{ getAverage(groupedEvaluations[item.subject]) || '-' }}</span
              >
            </v-subheader>
            <v-lazy min-height="50px" :key="item.id">
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
          </template>
          <v-list-item></v-list-item>
        </v-list>
      </template>
    </v-data-iterator>
    <v-list v-show="view.slice(0, 4) == 'type'">
      <v-list-item
        @click="$emit('input', item)"
        v-for="item in evaluationsByType[view.slice(5)]"
        :key="item.id"
      >
        <v-list-item-avatar>
          {{ item.numberValue }}
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-text="item.subject"></v-list-item-title>
          <v-list-item-subtitle v-text="item.theme"></v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-list-item-action-text>
            {{ formatDate(item.date) }}
          </v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
      <v-list-item></v-list-item>
    </v-list>
    <v-bottom-navigation fixed v-model="view" dark shift>
      <v-btn v-for="flag in views" :key="flag.id" :value="flag.id">
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

  get evaluationsByType() {
    return this.group(this.evaluations, 'type');
  }

  view = 'date';
  get views() {
    return [
      {
        id: 'sort:date',
        text: 'Dátum',
        icon: 'mdi-timeline-text'
      },
      {
        id: 'sort:creatingTime',
        text: 'Beírás',
        icon: 'mdi-timeline-plus'
      },
      {
        id: 'sort:subject',
        text: 'Tárgy',
        icon: 'mdi-format-list-bulleted-square'
      },
      {
        id: 'sort:numberValue',
        text: 'Értékelés',
        icon: 'mdi-format-list-bulleted-type'
      },
      ...Object.keys(this.evaluationsByType)
        .filter(k => k !== 'MidYear')
        .map(k => ({
          id: `type:${k}`,
          text: this.getEvaluationTypeName(k as any),
          icon: 'mdi-timeline'
        }))
    ];
  }
}
</script>
