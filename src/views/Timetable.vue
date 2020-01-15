<template>
  <v-container style="max-width: none">
    <v-sheet class="text-center" height="45">
      <v-btn
        text
        icon
        color="$primary"
        class="float-left"
        @click="$router.push(`/timetable/${cweek - 1}`)"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      {{ formatDate(new Date(week.from), false) }} -
      {{ formatDate(new Date(week.to), false) }}
      <v-btn
        text
        icon
        color="$primary"
        class="float-right"
        @click="$router.push(`/timetable/${cweek - -1}`)"
      >
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </v-sheet>
    <v-tab-items v-model="active" v-if="mobile">
      <v-tab-item v-for="(lessons, day) in timetable" :key="day">
        <LessonsList :lessons="lessons" v-model="selectedLesson"></LessonsList>
      </v-tab-item>
    </v-tab-items>
    <v-bottom-navigation fixed v-model="active" dark shift v-if="mobile">
      <v-btn v-for="(lessons, utc) in timetable" :key="utc">
        <span>{{ utc | day }}</span>
        <v-icon
          v-text="
            day(utc).substr(
              0,
              [3, 4, 6].includes(utc2date(utc).getDay()) ? 3 : 1
            )
          "
        ></v-icon>
      </v-btn>
    </v-bottom-navigation>
    <v-row no-gutters v-else>
      <v-col v-for="(lessons, utc) in timetable" :key="utc">
        <LessonsList
          :lessons="lessons"
          :header="day(utc)"
          :showCount="false"
          :min="min"
          v-model="selectedLesson"
        ></LessonsList>
      </v-col>
    </v-row>
    <DataViewer title="Óra" :fn="lessonValues" v-model="selectedLesson" />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Mixin from '@/mixins';
import LessonsList from '@/components/dataviews/LessonsList.vue';
import DataViewer from '@/components/DataViewer.vue';
import Component, { mixins } from 'vue-class-component';
import { Watch, Prop } from 'vue-property-decorator';
import { Lesson, TimetableAPI } from '@/api-types';
import { timeMapper } from '@/store';

@Component({
  components: { LessonsList, DataViewer },
  computed: timeMapper.mapGetters(['date'])
})
export default class TimetableComponent extends mixins(Mixin) {
  name = 'Órarend';
  date!: Date;

  active = 0;
  @Prop() cweek!: number;
  @Prop({ default: '' }) lessonHash!: string;

  timetable: TimetableAPI = {};
  selectedLesson: Lesson | boolean = false;
  min: null | number = null;

  @Watch('cweek')
  onCWeekChanged() {
    this.timetable = {};
    this.obtain('timetable', this.cweek).then((v: TimetableAPI) => {
      this.timetable = v;
      if (+this.date / 1000 in v) {
        this.active = Object.keys(v).indexOf(`${+this.date / 1000}`);
      }
      if (this.lessonHash) {
        const [date, nol] = this.lessonHash.split(':');
        for (const l of v[date]) {
          if (l.count == nol) {
            this.selectedLesson = l;
            break;
          }
        }
      }
      if (this.mobile == false) {
        const counts = Object.values(v)
          .flatMap(e => e)
          .map((l: Lesson) => l.count);
        this.min = Math.min(...counts);
        const max = Math.max(...counts);
        Vue.nextTick().then(() => {
          // @ts-ignore
          for (let i = +this.min; i < max; i++) {
            const lis = [...document.querySelectorAll(`.r${i}`)];
            const max = Math.max(
              ...lis.map((e: Element) => {
                return e.getBoundingClientRect().height;
              })
            );
            lis.forEach(e => ((e as HTMLElement).style.height = `${max}px`));
          }
        });
      }
    });
  }

  mounted() {
    this.onCWeekChanged();
  }
  get week() {
    return this.getWeek(this.cweek);
  }
  metaInfo = {
    title: 'Órarend'
  };
}
</script>
