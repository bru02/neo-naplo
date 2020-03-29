<template>
  <v-container grid-list-lg>
    <v-row dense justify="center">
      <NextLessonCard
        :timetable="timetable"
        :instituteName="instituteName"
        v-model="selectedLesson"
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
        <v-lazy :height="150">
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
            v-on:lesson="a => (selectedAbsence = a)"
          />
          <EventCard
            :event="card"
            v-else-if="card.category == 'events'"
            v-model="selectedEvent"
          />
          <ExamCard
            :exam="card"
            v-else-if="card.category == 'exams'"
            v-model="selectedExam"
          />
        </v-lazy>
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
    <DataViewer title="Számonkérés" :fn="examValues" v-model="selectedExam" />
    <Dialog title="Mulasztások" v-model="selectedAbsenceGroup">
      <AbsencesList
        :absences="selectedAbsenceGroup.items"
        v-model="selectedAbsence"
      />
    </Dialog>
  </v-container>
</template>
<script lang="ts">
import Vue from 'vue';
import Mixin from '@/mixins';
import { apiMapper, timeMapper } from '@/store';
import AbsencesList from '@/components/dataviews/AbsencesList.vue';
import DataViewer from '@/components/dialogs/DataViewer.vue';
import AbsencesCard from '@/components/cards/AbsencesCard.vue';
import EvaluationCard from '@/components/cards/EvaluationCard.vue';
import EventCard from '@/components/cards/EventCard.vue';
import NoteCard from '@/components/cards/NoteCard.vue';
import ExamCard from '@/components/cards/ExamCard.vue';
import NextLessonCard from '@/components/cards/NextLessonCard.vue';
import ChangedLessonCard from '@/components/cards/ChangedLessonCard.vue';
import Dialog from '@/components/dialogs/Dialog.vue';

import Component, { mixins } from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import {
  Note,
  Absence,
  Evaluation,
  Lesson,
  Event,
  AbsenceGroup,
  TimetableAPI,
  Exam
} from '../api-types';
@Component({
  computed: {
    ...apiMapper.mapState({
      loading: state => state.general.loading,
      instituteName: state => state.general.data.instituteName,
      evaluations: state => state.general.data.evaluations,
      exams: state => state.exams.data,
      notes: state => state.general.data.notes
    }),
    ...apiMapper.mapGetters(['cards', 'flatAbsences', 'events']),
    ...timeMapper.mapGetters(['date', 'time'])
  },
  components: {
    AbsencesList,
    DataViewer,
    AbsencesCard,
    EvaluationCard,
    EventCard,
    NoteCard,
    ExamCard,
    NextLessonCard,
    ChangedLessonCard,
    Dialog
  },
  metaInfo: {
    title: 'Faliújság'
  }
})
export default class HomeComponent extends mixins(Mixin) {
  selectedNote: Note | boolean = false;
  selectedAbsence: Absence | boolean = false;
  selectedEval: Evaluation | boolean = false;
  selectedLesson: Lesson | boolean = false;
  selectedEvent: Event | boolean = false;
  selectedExam: Exam | boolean = false;
  selectedAbsenceGroup: AbsenceGroup | boolean = false;
  timetable: TimetableAPI = {};
  time!: Date;
  date!: Date;
  loading!: boolean;
  instituteName!: string;

  evaluations!: Evaluation[];
  flatAbsences!: Absence[];
  notes!: Note[];
  events!: Event[];
  exams!: Exam[];
  mounted() {
    this.obtain('general').then(d => {
      if (d.instituteCode == 'klik035220001') this.obtain('hirdetmenyek');
    });
    this.obtain('events');
    this.obtain('exams');
    this.obtain('timetable').then(tt => {
      this.timetable = tt;
    });
  }

  @Watch('$route')
  onRouteChange() {
    if (this.$route.params.type) {
      const { type, id } = this.$route.params;
      switch (type) {
        case 'evaluation':
          if (!this.selectedEval)
            this.selectedEval =
              this.evaluations.find(e => e.id === +id) ?? false;
          break;
        case 'absence':
          if (!this.selectedAbsence)
            this.selectedAbsence =
              this.flatAbsences.find(e => e.id === +id) ?? false;
          break;
        case 'note':
          if (!this.selectedNote)
            this.selectedNote = this.notes.find(e => e.id === +id) ?? false;
          break;
        case 'event':
          if (!this.selectedEvent)
            this.selectedEvent = this.events.find(e => e.id === id) ?? false;
          break;
        case 'exam':
          if (!this.selectedExam)
            this.selectedExam = this.exams.find(e => e.id === id) ?? false;
          break;
      }
    } else {
      ['Eval', 'Absence', 'Note', 'Event', 'Exam'].forEach(e =>
        Vue.set(this, `selected${e}`, false)
      );
    }
  }

  @Watch('selectedEval')
  onselectedEvalChange(value) {
    if (value) {
      if (!this.$route.params.type)
        this.$router.push(`/evaluation/${value.id}`);
    } else {
      if (this.$route.params.type) this.$router.push(`/`);
    }
  }
  @Watch('selectedAbsence')
  onselectedAbsenceChange(value) {
    if (value) {
      if (!this.$route.params.type) this.$router.push(`/absence/${value.id}`);
    } else {
      if (this.$route.params.type) this.$router.push(`/`);
    }
  }
  @Watch('selectedNote')
  onselectedNoteChange(value) {
    if (value) {
      if (!this.$route.params.type) this.$router.push(`/note/${value.id}`);
    } else {
      if (this.$route.params.type) this.$router.push(`/`);
    }
  }
  @Watch('selectedEvent')
  onselectedEventChange(value) {
    if (value) {
      if (!this.$route.params.type) this.$router.push(`/event/${value.id}`);
    } else {
      if (this.$route.params.type) this.$router.push(`/`);
    }
  }

  @Watch('selectedExam')
  onselectedExamChange(value) {
    if (value) {
      if (!this.$route.params.type) this.$router.push(`/exam/${value.id}`);
    } else {
      if (this.$route.params.type) this.$router.push(`/`);
    }
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
}
</script>
