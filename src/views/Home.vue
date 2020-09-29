<template>
  <v-container grid-list-lg>
    <v-row dense justify="center">
      <NextLessonCard
        :timetable="timetable"
        :instituteName="instituteName"
        @input="$router.push(`/lesson/${$event}`)"
      ></NextLessonCard>
      <ChangedLessonCard
        v-for="lesson in changedLessons"
        :key="lesson.id"
        :lesson="lesson"
        @input="$router.push(`/lesson/${$event}`)"
      >
      </ChangedLessonCard>
      <v-skeleton-loader
        :type="new Array(loadingCount).fill('image').join(', ')"
      >
      </v-skeleton-loader>
      <v-col
        cols="12"
        v-for="card in cardsToRender"
        :key="(card.id || card.date || card[0].date) + card.category"
      >
        <v-lazy :height="100">
          <NoteCard
            :note="card"
            v-if="card.category === 'notes'"
            @input="$router.push(`/note/${$event}`)"
          />
          <EvaluationCard
            :evaluation="card"
            v-else-if="card.category === 'evaluations'"
            @input="$router.push(`/evaluation/${$event}`)"
          />
          <AbsencesCard
            :absences="card"
            v-else-if="card.category === 'absences'"
            @input="$router.push(`/absence/${$event}`)"
            @absences="selectedAbsenceGroup = event"
          />
          <EventCard
            :event="card"
            v-else-if="card.category === 'events'"
            @input="$router.push(`/event/${$event}`)"
          />
          <ExamCard
            :exam="card"
            v-else-if="card.category === 'exams'"
            @input="$router.push(`/exam/${$event}`)"
          />
        </v-lazy>
      </v-col>
      <hr v-intersect="onIntersect" />

      <v-alert
        value
        type="info"
        v-if="cards.length === 0 && loadingCount === 0"
      >
        Még üres a napló
      </v-alert>
    </v-row>
    <router-view></router-view>
    <Dialog title="Mulasztások" v-model="selectedAbsenceGroup">
      <AbsencesList
        :absences="selectedAbsenceGroup.items"
        v-model="selectedAbsence"
      />
    </Dialog>
  </v-container>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import { apiMapper, timeMapper } from '@/store';
import AbsencesList from '@/components/dataviews/AbsencesList.vue';
import AbsencesCard from '@/components/cards/AbsencesCard.vue';
import EvaluationCard from '@/components/cards/EvaluationCard.vue';
import EventCard from '@/components/cards/EventCard.vue';
import NoteCard from '@/components/cards/NoteCard.vue';
import ExamCard from '@/components/cards/ExamCard.vue';
import NextLessonCard from '@/components/cards/NextLessonCard.vue';
import ChangedLessonCard from '@/components/cards/ChangedLessonCard.vue';
import Dialog from '@/components/dialogs/Dialog.vue';

import Component, { mixins } from 'vue-class-component';
import {
  Note,
  Absence,
  Evaluation,
  Lesson,
  Event,
  TimetableAPI,
  Exam,
} from '../api-types';
@Component({
  computed: {
    ...apiMapper.mapState({
      loadingCount: (state) => {
        const score = (res) => (state[res].loaded ? 0 : 1);
        return score('general') + score('events') + score('exams');
      },
      instituteName: (state) => state.general.data.instituteName,
      evaluations: (state) => state.general.data.evaluations,
      exams: (state) => state.exams.data,
      notes: (state) => state.general.data.notes,
    }),
    ...apiMapper.mapGetters(['cards', 'absences', 'events']),
    ...timeMapper.mapGetters(['date', 'time']),
  },
  components: {
    AbsencesList,
    AbsencesCard,
    EvaluationCard,
    EventCard,
    NoteCard,
    ExamCard,
    NextLessonCard,
    ChangedLessonCard,
    Dialog,
  },
  metaInfo: {
    title: 'Faliújság',
  },
})
export default class HomeComponent extends mixins(Mixin) {
  selectedAbsenceGroup: Absence[] | boolean = false;
  timetable: TimetableAPI = {};
  time!: Date;
  date!: Date;
  loading!: boolean;
  instituteName!: string;

  evaluations!: Evaluation[];
  absences!: Absence[];
  notes!: Note[];
  events!: Event[];
  exams!: Exam[];
  cards!: any[];

  maxLen = 10;

  mounted() {
    this.obtain('general').then((d) => {
      if (d.instituteCode === 'klik035220001') this.obtain('hirdetmenyek');
    });
    this.obtain('events');
    this.obtain('exams');
    this.obtain('timetable').then((tt) => {
      this.timetable = tt;
    });
  }

  get changedLessons() {
    const lessons: Lesson[] = [];
    for (const [key, ls] of Object.entries(this.timetable)) {
      if (+key * 1000 >= +this.date) {
        lessons.push(...ls);
      }
    }
    return lessons.filter(
      (l) =>
        (!!l.deputyTeacher || l.state === 'Missed') &&
        l.endTime * 1000 > +this.time
    );
  }

  get cardsToRender() {
    return this.cards.slice(0, this.maxLen);
  }

  onIntersect() {
    if (this.maxLen < this.cards.length) {
      this.maxLen += 10;
    }
  }
}
</script>
