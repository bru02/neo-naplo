<template>
  <v-col cols="12">
    <v-card
      @click.native="$emit('input', lessons)"
      dark
      color="blue"
      v-if="mode != 'hidden'"
    >
      <!-- <v-layout align-center justify-center>
        <v-flex xs12> -->
      <v-card-title primary-title>
        {{ mode == 'today' ? nextLesson.subject : `${lessons.length} db` }}
      </v-card-title>
      <v-card-subtitle>
        <!-- <div> -->
        {{
          mode == 'today'
            ? `lesz a következő órád, ${timeTillNextLesson}`
            : 'órád lesz holnap'
        }}
        <span v-for="c in changes" :key="c.text" :class="[c.color]">{{
          c.text
        }}</span>
        <!-- </div> -->
      </v-card-subtitle>
      <!-- </v-flex>
      </v-layout> -->
      <v-divider light></v-divider>
      <v-card-actions class="pa-3" v-if="mode == 'today'">
        {{ nextLesson.count }} / {{ lessons.length }}
        <v-spacer></v-spacer>
        {{ nextLesson.classRoom }}
      </v-card-actions>
    </v-card>
  </v-col>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { TimetableAPI } from '../../api-types';
import { timeMapper } from '@/store';

@Component({
  computed: timeMapper.mapGetters(['time', 'date'])
})
export default class NextLessonCard extends mixins(Mixin) {
  time!: Date;
  date!: Date;

  @Prop() readonly timetable!: TimetableAPI;

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
    return +this.date / 1000 + (this.mode == 'tomorrow' ? 24 * 60 * 60 : 0);
  }

  get lessons() {
    return this.timetable[this.timetableKey] || [];
  }

  get nextLesson() {
    if (this.mode == 'today') {
      for (let l of this.lessons) {
        if (l.startTime * 1000 > +this.time) {
          return l;
        }
      }
    }
    return null;
  }

  get timeTillNextLesson() {
    if (this.mode == 'today') {
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
    const substitued = this.lessons.filter(l => !!l.deputyTeacher);
    const missed = this.lessons.filter(l => l.state == 'Missed');
    let ret: any[] = [];
    if (substitued.length) {
      ret.push({
        color: '',
        text: ` amiből `
      });
      ret.push({
        color: 'green--text',
        text: `${substitued.length}-n helyettesítés lesz`
      });
    }
    if (missed.length) {
      if (substitued.length) {
        ret.push({
          color: '',
          text: ` és `
        });
      } else {
        ret.push({
          color: '',
          text: ` amiből `
        });
      }
      ret.push({
        color: 'green--text',
        text: `${missed.length} elmarad`
      });
    }
    return ret;
  }
}
</script>
