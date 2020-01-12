<template>
  <v-container grid-list-lg>
    <v-row dense justify="center">
      <NextLessonCard
        :timetable="timetable"
        v-model="selectedLessons"
      ></NextLessonCard>
      <ChangedLessonCard
        v-for="lesson in changedLessons"
        :key="lesson.id"
        :lesson="lesson"
        v-model="selectedLesson"
      >
      </ChangedLessonCard>
      <v-col
        cols="12"
        v-for="card in cards"
        :key="(card.id || card.date) + card.category"
      >
        <NoteCard
          :note="card"
          v-if="card.category == 'notes'"
          v-model="selectedNote"
        />
        <EvaluationCard
          :evaluation="card"
          v-else-if="card.category == 'evaluations'"
          v-model="selectedEval"
        />
        <AbsencesCard
          :absences="card"
          v-else-if="card.category == 'absences'"
          v-model="selectedAbsenceGroup"
        />
        <EventCard
          :event="card"
          v-else-if="card.category == 'events'"
          v-model="selectedEvent"
        />
      </v-col>
      <v-alert :value="true" type="info" v-show="cards.length == 0 && !loading">
        Még nem kaptál semmit..
      </v-alert>
    </v-row>
    <DataViewer title="Feljegyzés" :fn="noteValues" v-model="selectedNote" />
    <DataViewer
      title="Mulasztás"
      :fn="absenceValues"
      v-model="selectedAbsence"
    />
    <DataViewer title="Értékelés" :fn="evalValues" v-model="selectedEval" />
    <DataViewer title="Óra" :fn="lessonValues" v-model="selectedLesson" />
    <DataViewer title="Faliújság" :fn="eventValues" v-model="selectedEvent" />
    <Dialog title="Mulasztások" v-model="selectedAbsenceGroup">
      <AbsencesList
        :absences="selectedAbsenceGroup.items"
        v-model="selectedAbsence"
      />
    </Dialog>
    <Dialog title="Órák" v-model="selectedLessons">
      <LessonList :lessons="selectedLessons || []" v-model="selectedLesson" />
    </Dialog>
  </v-container>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import { apiMapper, timeMapper } from '@/store';
import AbsencesList from '@/components/dataviews/AbsencesList.vue';
import LessonList from '@/components/dataviews/LessonsList.vue';
import DataViewer from '@/components/DataViewer.vue';
import AbsencesCard from '@/components/cards/AbsencesCard.vue';
import EvaluationCard from '@/components/cards/EvaluationCard.vue';
import EventCard from '@/components/cards/EventCard.vue';
import NoteCard from '@/components/cards/NoteCard.vue';
import NextLessonCard from '@/components/cards/NextLessonCard.vue';
import ChangedLessonCard from '@/components/cards/ChangedLessonCard.vue';
import Dialog from '@/components/Dialog.vue';

import Component, { mixins } from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import {
  Note,
  Absence,
  Evaluation,
  Lesson,
  Event,
  AbsenceGroup,
  TimetableAPI
} from '../api-types';
@Component({
  computed: {
    ...apiMapper.mapState({
      events: state => state.general.data.events,
      loading: state => state.general.loading
    }),
    ...apiMapper.mapGetters(['cards']),
    ...timeMapper.mapGetters(['date', 'time'])
  },
  components: {
    AbsencesList,
    LessonList,
    DataViewer,
    AbsencesCard,
    EvaluationCard,
    EventCard,
    NoteCard,
    NextLessonCard,
    ChangedLessonCard,
    Dialog
  }
})
export default class HomeComponent extends mixins(Mixin) {
  name = 'Kezdőlap';
  selectedNote: Note | boolean = false;
  selectedAbsence: Absence | boolean = false;
  selectedEval: Evaluation | boolean = false;
  selectedLesson: Lesson | boolean = false;
  selectedLessons: Lesson[] | boolean = false;
  selectedEvent: Event | boolean = false;
  selectedAbsenceGroup: AbsenceGroup | boolean = false;
  timetable: TimetableAPI = {};
  time!: Date;
  date!: Date;
  loading!: boolean;
  mounted() {
    this.obtain('general');
    this.obtain('timetable').then(tt => (this.timetable = tt));
  }
  get changedLessons() {
    const lessons: Lesson[] = [];
    for (const [key, ls] of Object.entries(this.timetable)) {
      if (+key * 1000 >= +this.date) {
        lessons.push(...ls);
      }
    }
    return lessons.filter(
      l =>
        (!!l.deputyTeacher || l.state == 'Missed') &&
        l.endTime * 1000 > +this.time
    );
  }
  metaInfo = {
    title: 'Faliújság'
  };
}
</script>
