<template>
  <v-col cols="12">
    <v-card
      @click.native="lessonsDialog = true"
      dark
      color="blue"
      v-if="mode != 'hidden'"
    >
      <div class="d-flex flex-no-wrap">
        <v-avatar class="ma-3" size="auto" tile v-if="mobile && lessonButtons">
          <v-icon> mdi-bag-personal{{ packed ? '' : '-off' }} </v-icon>
        </v-avatar>
        <div>
          <v-card-title primary-title>
            {{ mode === 'today' ? nextLesson.subject : `${lessons.length} db` }}
          </v-card-title>
          <v-card-subtitle>
            {{
              mode === 'today'
                ? `lesz a következő órád, ${timeTillNextLesson}`
                : 'órád lesz holnap'
            }}
            <span
              v-for="c in changes"
              :key="c.text"
              :class="[c.color, 'font-style-bold']"
              >{{ c.text }}</span
            >
          </v-card-subtitle>
        </div>
      </div>
      <v-divider light></v-divider>
      <v-card-actions class="pa-3" v-if="mode === 'today'">
        {{ nextLesson.count }} / {{ lessons[lessons.length - 1].count }}
        <v-spacer></v-spacer>
        {{ nextLesson.classRoom }}
      </v-card-actions>
    </v-card>
    <Dialog title="Órák" v-model="lessonsDialog">
      <template v-slot:toolbar v-if="lessonButtons">
        <v-btn icon :href="directions" target="_blank">
          <v-icon> mdi-directions </v-icon>
        </v-btn>
        <v-btn icon @click="packDialog = true">
          <v-icon> mdi-bag-personal{{ packed ? '' : '-off' }} </v-icon>
        </v-btn>
      </template>
      <LessonList :lessons="lessons || []" v-on:input="selectedLesson = l" />
    </Dialog>
    <Dialog title="Bepakolás" v-model="packDialog">
      <template v-slot:toolbar v-if="lessonButtons">
        <v-btn icon @click="packDialog = lessonsDialog = false">
          <v-fab-transition>
            <v-icon :key="packed"> mdi-check{{ packed ? '-all' : '' }} </v-icon>
          </v-fab-transition>
        </v-btn>
      </template>
      <transition-group name="list" tag="v-list">
        <v-list-item
          v-for="subject in packData"
          :key="subject.name"
          :value="subject.name"
          v-ripple
          @click.capture.stop="toggle(subject.name)"
        >
          <v-list-item-action>
            <v-checkbox
              v-model="pack"
              color="primary"
              :value="subject.name"
              :indeterminate="subject.indeterminate"
            ></v-checkbox>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title> {{ subject.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </transition-group>
    </Dialog>
    <lesson-dialog v-if="!!selectedLesson" :lesson="selectedLesson" />
  </v-col>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { Lesson, TimetableAPI } from '../../api-types';
import { timeMapper } from '@/store';
import LessonList from '@/components/dataviews/LessonsList.vue';
import Dialog from '@/components/dialogs/Dialog.vue';
import LessonDialog from '@/components/dialogs/LessonDialog.vue';

interface packDataItem {
  name: string;
  indeterminate: boolean;
}

@Component({
  computed: timeMapper.mapGetters(['time', 'date']),
  components: { LessonList, Dialog, LessonDialog },
})
export default class NextLessonCard extends mixins(Mixin) {
  time!: Date;
  date!: Date;

  @Prop() readonly timetable!: TimetableAPI;
  @Prop() readonly instituteName!: string;

  packDialog = false;
  pack: string[] = [];
  packData: packDataItem[] = [];

  lessonsDialog = false;
  selectedLesson: Lesson | null = null;
  get mode() {
    let timetableKey = +this.date / 1000;
    let lessons = this.timetable[timetableKey] || [];
    if (
      lessons.length > 0 &&
      lessons.slice(-1)[0].startTime * 1000 > +this.time
    ) {
      return 'today';
    }
    timetableKey += 24 * 60 * 60;
    lessons = this.timetable[timetableKey] || [];
    if (lessons.length > 0) {
      return 'tomorrow';
    }
    return 'hidden';
  }

  get timetableKey() {
    return +this.date / 1000 + (this.mode === 'tomorrow' ? 24 * 60 * 60 : 0);
  }

  get lessons() {
    return this.timetable[this.timetableKey] || [];
  }

  get nextLesson() {
    if (this.mode === 'today') {
      for (let l of this.lessons) {
        if (l.startTime * 1000 > +this.time) {
          return l;
        }
      }
    }
    return null;
  }

  get timeTillNextLesson() {
    if (this.mode === 'today') {
      const MILLISECONDS_MINUTE = 60 * 1000;
      const MILLISECONDS_HOUR = 60 * MILLISECONDS_MINUTE;

      let ht = '',
        offset =
          // @ts-ignore: nem lehet null mert okok
          1000 * this.nextLesson.startTime - +this.time;
      if (offset > MILLISECONDS_HOUR) {
        ht = `${Math.floor(offset / MILLISECONDS_HOUR)} óra és `;
      }

      return `${ht}${Math.floor(
        (offset % MILLISECONDS_HOUR) / MILLISECONDS_MINUTE
      )} perc múlva`;
    }
    return null;
  }

  get changes() {
    if (this.mode != 'tomorrow') return [];
    const substitued = this.lessons.filter((l) => !!l.deputyTeacher);
    const missed = this.lessons.filter((l) => l.state === 'Missed');
    let ret: any[] = [];
    if (substitued.length) {
      ret.push({
        color: '',
        text: ` amiből `,
      });
      ret.push({
        color: 'green--text',
        text: `${substitued.length}-n helyettesítés lesz`,
      });
    }
    if (missed.length) {
      if (substitued.length) {
        ret.push({
          color: '',
          text: ` és `,
        });
      } else {
        ret.push({
          color: '',
          text: ` amiből `,
        });
      }
      ret.push({
        color: 'red--text',
        text: `${missed.length} elmarad`,
      });
    }
    return ret;
  }
  get lessonButtons() {
    return this.firstLessonTomorrow?.startTime * 1000 > +this.time;
  }
  get firstLessonTomorrow() {
    return this.timetable[this.timetableKey]?.[0] ?? undefined;
  }
  @Watch('packDialog')
  onPackDialogChange(value) {
    const timetableKey = this.firstLessonTomorrow.date;

    if (value) {
      this.pack =
        JSON.parse(localStorage.getItem('packData') || '{}')[timetableKey] ||
        [];
      const lessonsBefore = (
        this.timetable[this.timetableKey - 24 * 60 * 60] || []
      )
        .filter((l) => {
          return l.presenceType !== 'Absence' && l.state !== 'Missed';
        })
        .map((l) => {
          return l.subject;
        });
      this.packData = this.lessons
        .filter((e) => {
          return e.state != 'Missed';
        })
        .map(({ subject }) => subject)
        .filter((e, i, a) => {
          return a.indexOf(e) === i;
        })
        .map((subject) => {
          return {
            name: subject,
            indeterminate:
              lessonsBefore.includes(subject) && !this.pack.includes(subject),
          };
        })
        .sort((a, b) => this.getSortIndex(a) - this.getSortIndex(b));
    } else {
      localStorage.setItem(
        'packData',
        JSON.stringify({ [timetableKey]: this.pack })
      );
    }
  }

  @Watch('lessonButtons')
  onModeChanged(v: boolean) {
    if (v) this.onPackDialogChange(true);
  }

  toggle(subject) {
    const currIndex = this.packData.findIndex((d) => d.name === subject);
    let newIndex = currIndex;
    if (this.pack.includes(subject)) {
      newIndex = this.findFirstWithSortIndex(1);
      if (newIndex === -1) newIndex = this.findFirstWithSortIndex(2);
      if (newIndex === -1) newIndex = currIndex;
      this.pack.splice(this.pack.indexOf(subject), 1);
    } else {
      this.packData[currIndex].indeterminate = false;
      newIndex = this.findFirstWithSortIndex(2) - 1;
      if (newIndex === -2) newIndex = this.packData.length;
      this.pack.push(subject);
    }

    const newVal = [...this.packData];
    newVal.splice(currIndex, 1);
    newVal.splice(newIndex, 0, this.packData[currIndex]);
    this.packData = newVal;
  }
  get directions() {
    return `https://www.google.com/maps/dir//${
      this.instituteName
    }/data=!4m6!4m5!2m3!6e1!7e2!8j${
      this.firstLessonTomorrow.startTime + 110 * 60
    }!3e3`;
  }
  get packed() {
    return this.packData.length === this.pack.length;
  }
  getSortIndex(x: packDataItem) {
    if (this.pack.includes(x.name)) return 2;
    return x.indeterminate ? 1 : 0;
  }
  findFirstWithSortIndex(i: 0 | 1 | 2) {
    return this.packData.map(this.getSortIndex).indexOf(i);
  }
}
</script>
<style>
.list-enter,
.list-leave-to {
  opacity: 0;
}
.list-enter-active,
.list-leave-active {
  transition: opacity 0.5s ease;
}
.list-move {
  transition: transform 0.5s ease-out;
}
</style>
