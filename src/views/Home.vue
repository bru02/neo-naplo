<template>
  <v-container grid-list-lg>
    <v-row dense justify="center">
      <NextLessonCard
        :timetable="timetable"
        v-model="selectedLessons"
        :packed="bag.length == bagData.length"
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
            v-model="selectedNote"/>
          <EvaluationCard
            :evaluation="card"
            v-else-if="card.category == 'evaluations'"
            v-model="selectedEval"/>
          <AbsencesCard
            :absences="card"
            v-else-if="card.category == 'absences'"
            v-model="selectedAbsenceGroup"/>
          <EventCard
            :event="card"
            v-else-if="card.category == 'events'"
            v-model="selectedEvent"
        /></v-lazy>
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
      <template
        v-slot:toolbar
        v-if="selectedLessons && selectedLessons[0].startTime * 1000 > time"
      >
        <!-- <v-btn icon :href='getDirections(selectedLessons[0].startTime * 1000)' target='_blank'>
          <v-icon>
            mdi-directions
          </v-icon>
        </v-btn> -->
        <v-btn icon @click="bagDialog = true">
          <v-icon>
            mdi-bag-personal{{ bag.length == bagData.length ? '' : '-off' }}
          </v-icon>
        </v-btn>
      </template>
      <LessonList :lessons="selectedLessons || []" v-model="selectedLesson" />
    </Dialog>
    <Dialog title="Bepakolás" v-model="bagDialog">
      <v-list>
        <v-list-item
          v-for="subject in bagData"
          :key="subject.name"
          :value="subject.name"
          v-ripple
          @click.capture.stop="toggle(subject.name)"
        >
          <v-list-item-action>
            <v-checkbox
              v-model="bag"
              color="primary"
              :value="subject.name"
              :indeterminate="subject.indeterminate"
            ></v-checkbox>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title> {{ subject.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
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
      loading: state => state.general.loading,
      instituteName: state => state.general.data.instituteName
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
  instituteName!: string;
  bagDialog = false;
  bagData: { name: string; indeterminate: boolean }[] = [];
  bag: string[] = [];
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
  @Watch('bagDialog')
  onBagDialogChange(value) {
    const timetableKey = this.selectedLessons[0].date;

    if (value) {
      const lessons = this.timetable[timetableKey];
      const lessonsBefore = (
        this.timetable[timetableKey - 24 * 60 * 60] || []
      ).map(l => {
        return l.subject;
      });
      this.bag =
        JSON.parse(localStorage.getItem('bagData') || '{}')[timetableKey] || [];
      this.bagData = lessons
        .filter((e, i, a) => {
          return a.indexOf(e) == i && e.state != 'Missed';
        })
        .map(({ subject }) => {
          return {
            name: subject,
            indeterminate: lessonsBefore.includes(subject)
          };
        });
    } else {
      localStorage.setItem(
        'bagData',
        JSON.stringify({ [timetableKey]: this.bag })
      );
    }
  }
  toggle(subject) {
    if (this.bag.includes(subject)) {
      this.bag.splice(this.bag.indexOf(subject), 1);
    } else {
      this.bag.push(subject);
    }
  }
  // getDirections(startTime) {
  //   const parts = new Date(startTime + 3000000).toJSON().split('T') // 10p
  //   const dateParts = parts[0].split('-')
  //   return `https://www.google.com/maps/?daddr=${this.instituteName}&date=${dateParts[1]}/${dateParts[2]}/${dateParts[0]}&time=${parts[1].substr(0, 5)}&ttype=arr&dirflg=r`
  // }
  metaInfo = {
    title: 'Faliújság'
  };
}
</script>
