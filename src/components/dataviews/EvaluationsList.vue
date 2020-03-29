<template>
  <v-container v-scroll="onScroll">
    <v-data-iterator
      disable-pagination
      :sort-by="view.slice(5)"
      v-show="view.slice(0, 4) == 'sort'"
      sort-desc
      hide-default-footer
      :items="evaluationsByType.MidYear"
    >
      <template v-slot:default="props">
        <v-list two-line subheader style="position:relative">
          <template v-for="(item, i) in props.items">
            <v-subheader
              v-if="
                view == 'sort:subject' &&
                  (i == 0 || props.items[i - 1].subject != item.subject)
              "
              v-pushpin="getPushpinOpts(item.subject)"
              :key="item.subject"
              style="z-index:4;background:#fff;width:100%"
              >{{ item.subject }} &#10240; &mdash; &#10240;
              <span
                :style="{
                  color: getEvaluationColor(
                    getAverage(groupedEvaluations[item.subject])
                  )
                }"
              >
                {{ getAverage(groupedEvaluations[item.subject]) || '-' }}</span
              >
            </v-subheader>
            <v-lazy
              min-height="72px"
              :key="item.id"
              :data-subject="item.subject"
            >
              <EvaluationListItem
                v-on:input="$emit('input', $event)"
                :eval="item"
              />
            </v-lazy>
          </template>
          <v-list-item></v-list-item>
        </v-list>
      </template>
    </v-data-iterator>
    <v-list v-show="view.slice(0, 4) == 'type'">
      <EvaluationListItem
        v-on:input="$emit('input', $event)"
        v-for="item in evaluationsByType[view.slice(5)]"
        :key="item.id"
        :eval="item"
      />

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
import Vue from 'vue';
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { Evaluation, ClassAverage } from '../../api-types';
import { VPushPin } from '@/directives/pushpin';
import EvaluationListItem from '@/components/listItems/EvaluationListItem.vue';
@Component({
  components: { EvaluationListItem },
  directives: { pushpin: VPushPin }
})
export default class EvaluationList extends mixins(Mixin) {
  @Prop() readonly evaluations!: Evaluation[];
  @Prop() readonly groupedEvaluations!: { [k: string]: Evaluation[] };
  scrollY = 0;
  onScroll() {
    this.scrollY =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
  }
  get evaluationsByType() {
    return this.group(this.evaluations, 'type');
  }
  pushpinPositions = {};
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
  getPushpinOpts(subject) {
    const spec = this.pushpinPositions[subject] ?? {};
    return {
      top: spec.top ?? Infinity,
      bottom: spec.bottom ?? 0,
      offset: 48,
      scrollY: this.scrollY
    };
  }

  @Watch('view')
  onViewChange() {
    if (this.view === 'sort:subject') {
      Vue.nextTick(() => {
        const subjects = Object.keys(this.groupedEvaluations);
        for (const subject of subjects) {
          const listItems = document.querySelectorAll(
            `[data-subject="${subject}"]`
          );
          if (listItems.length === 0) continue;
          console.log(listItems);
          Vue.set(this.pushpinPositions, subject, {
            top: listItems[0].getBoundingClientRect().top - 48,
            bottom:
              listItems[listItems.length - 1].getBoundingClientRect().bottom -
              72
          });
          console.log(listItems[listItems.length - 1].getBoundingClientRect());
        }
      });
    }
  }
}
</script>
