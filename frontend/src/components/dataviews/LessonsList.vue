<template>
  <v-list two-line :dense="showCount" :subheader="!!header">
    <v-subheader v-show="!!header">{{ header }}</v-subheader>
    <v-list-item
      v-for="lesson in groupedLessons"
      v-ripple
      :key="lesson.id"
      @click="lesson && $emit('input', lesson)"
    >
      <v-list-item-icon v-show="showCount">
        <h4>{{ lesson.count }}</h4>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title :class="{ 'red--text': lesson.state == 'Missed' }">{{
          lesson.subject + (lesson.state == 'Missed' ? ' (Elmarad)' : '')
        }}</v-list-item-title>
        <v-list-item-subtitle class="text--primary">{{
          lesson.deputyTeacher
            ? `Helyettesítő: ${lesson.deputyTeacher}`
            : lesson.teacher
        }}</v-list-item-subtitle>
        <v-list-item-subtitle>{{ lesson.theme }}</v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-list-item-action-text>{{
          lesson.classRoom
        }}</v-list-item-action-text>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
@Component
export default class LessonList extends mixins(Mixin) {
  @Prop(Array) readonly lessons: any[] | undefined;
  @Prop({ default: '' }) readonly header!: string;
  @Prop({ default: true }) readonly showCount!: boolean;

  get groupedLessons() {
    if (this.mobile) {
      return this.lessons;
    } else {
      // @ts-ignore
      let n: number[] = Object.keys(this.lessons),
        min = Math.min(...n);
      return [...Array(Math.max(...n) - min + 1).keys()].map(i => {
        // @ts-ignore
        return this.lessons[i + min] || false;
      });
    }
  }
}
</script>
