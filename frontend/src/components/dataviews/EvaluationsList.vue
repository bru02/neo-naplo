<template>
  <v-container>
    <v-tabs v-model="sortBy">
      <v-tab key="date">
        <v-list two-line>
          <template v-for="(items, header) in byDate">
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
                <v-list-item-subtitle
                  v-text="item.theme"
                ></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                {{ formatDate(item.date) }}
              </v-list-item-action>
            </v-list-item>

            <v-divider inset :key="header + '_div'"></v-divider>
          </template>
        </v-list>
      </v-tab>
      <v-tab key="creatingTime">
        <v-list two-line>
          <template v-for="(items, header) in byCreatingTime">
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
                <v-list-item-subtitle
                  v-text="item.theme"
                ></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                {{ formatDate(item.date) }}
              </v-list-item-action>
            </v-list-item>

            <v-divider inset :key="header + '_div'"></v-divider>
          </template>
        </v-list>
      </v-tab>
      <v-tab key="subject">
        <v-list two-line subheader>
          <template v-for="(items, header) in groupedEvaluations">
            <v-subheader inset :key="header"
              >{{ header }} &mdash; &#10240;
              <span :class="[`${getEvaluationColor(getAverage(items))}--text`]">
                {{ getAverage(items) }}</span
              >
            </v-subheader>
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
                <v-list-item-subtitle
                  v-text="item.theme"
                ></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                {{ formatDate(item.date) }}
              </v-list-item-action>
            </v-list-item>

            <v-divider inset :key="header + '_div'"></v-divider>
          </template>
        </v-list>
      </v-tab>
      <v-tab key="value">
        <v-list two-line subheader>
          <template v-for="(items, header) in byValue">
            <v-subheader inset :key="header">{{ header }} </v-subheader>
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
                <v-list-item-subtitle
                  v-text="item.theme"
                ></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                {{ formatDate(item.date) }}
              </v-list-item-action>
            </v-list-item>

            <v-divider inset :key="header + '_div'"></v-divider>
          </template>
        </v-list>
      </v-tab>
    </v-tabs>
    <v-list two-line subheader>
      <template v-for="(items, header) in sorted">
        <v-subheader inset :key="header" v-if="!!header"
          >{{ header }}
          <template v-show="sortBy == 'subject'">
            &mdash; &#10240;
            <span :class="[`${getEvaluationColor(getAverage(items))}--text`]">
              {{ getAverage(items) }}</span
            >
          </template>
        </v-subheader>
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
  @Prop() readonly groupedEvaluations!: { [k: string]: Evaluation[] };

  sortBy = 'date';
  get sorted() {
    switch (this.sortBy) {
      case 'date':
        return this.byDate;
      case 'creatingTime':
        return this.byCreatingTime;
      case 'value':
        return this.byValue;
      case 'subject':
      default:
        return this.groupedEvaluations;
    }
  }
  get byDate() {
    return {
      '': this.evaluations.sort((a, b) => b.date - a.date)
    };
  }
  get byCreatingTime() {
    return {
      '': this.evaluations.sort((a, b) => b.creatingTime - a.creatingTime)
    };
  }
  get byValue() {
    return this.group(this.evaluations, 'value');
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
