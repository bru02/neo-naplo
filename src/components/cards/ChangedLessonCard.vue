<template>
  <v-col cols="12">
    <v-card
      :color="mode === 'missed' ? 'red' : 'green'"
      dark
      @click.native="$emit('input', lesson)"
    >
      <v-card-title primary-title class="font-weight-thin">
        {{ lesson.subject }}{{ mode === 'substitution' ? ' órán' : '' }},
      </v-card-title>
      <v-card-subtitle>
        {{ relativeDay }} {{ lesson.count }}.
        {{ mode === 'substitution' ? 'órában' : 'óra' }}

        <b>{{
          mode === 'substitution'
            ? `${lesson.deputyTeacher} helyettesít`
            : 'elmarad'
        }}</b
        >.
      </v-card-subtitle>

      <v-divider light></v-divider>
    </v-card>
  </v-col>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Lesson } from '../../api-types';
import { timeMapper } from '@/store';
import { day as getDay } from '@/helpers';
@Component({
  computed: timeMapper.mapGetters(['time', 'date'])
})
export default class ChangedLessonCard extends mixins(Mixin) {
  time!: Date;
  date!: Date;
  @Prop() readonly lesson!: Lesson;
  get mode() {
    return this.lesson.state === 'Missed' ? 'missed' : 'substitution';
  }
  get relativeDay() {
    let day: String;
    if (this.lesson.date === +this.date / 1000) {
      day = this.mode === 'missed' ? '' : 'Ma ';
    } else if (this.lesson.date === +this.date / 1000 + 24 * 60 * 60) {
      day = 'Holnap ';
    } else {
      day = getDay(this.lesson.date);
    }
    if (this.mode === 'missed') {
      day = day.substr(0, 1).toUpperCase() + day.slice(1) + ' a(z) ';
    }
    return day;
  }
}
</script>
