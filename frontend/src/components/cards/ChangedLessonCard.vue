<template>
  <v-col cols="12">
    <v-card
      :color="mode == 'missed' ? 'red' : 'green'"
      dark
      @click.native="$emit('input', lesson)"
    >
      <!-- <v-layout align-center justify-center>
        <v-flex xs12> -->
      <v-card-title primary-title class="font-weight-thin">
        <!-- <div class="text-xs-right font-weight-thin">
              <div> -->
        {{ lesson.subject }}{{ mode == 'substitution' ? ' órán' : '' }},
        <!-- </div> -->
        <!-- <div> -->

        <!-- </div> -->
        <!-- </div> -->
      </v-card-title>
      <v-card-subtitle>
        {{ relativeDay }} {{ lesson.count }}.
        {{ mode == 'substitution' ? 'órában' : 'óra' }}

        <b>{{
          mode == 'substitution'
            ? `${lesson.deputyTeacher} helyettesít`
            : 'elmarad'
        }}</b
        >.
      </v-card-subtitle>
      <!-- </v-flex>
      </v-layout> -->
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

@Component({
  computed: timeMapper.mapGetters(['time', 'date'])
})
export default class ChangedLessonCard extends mixins(Mixin) {
  time!: Date;
  date!: Date;
  @Prop() readonly lesson!: Lesson;
  get mode() {
    return this.lesson.state == 'Missed' ? 'missed' : 'substitution';
  }
  get isToday() {
    return this.lesson.date == +this.date / 1000;
  }
  get relativeDay() {
    let day: String;
    if (this.lesson.date == +this.date / 1000) {
      day = this.mode == 'missed' ? '' : 'Ma ';
    } else if (this.lesson.date == +this.date / 1000 + 24 * 60 * 60) {
      day = 'Holnap ';
    } else {
      day = this.day(this.lesson.date);
    }
    if (this.mode == 'missed') {
      day = day.substr(0, 1).toUpperCase() + day.slice(1) + 'a(z) ';
    }
    return day;
  }
}
</script>
