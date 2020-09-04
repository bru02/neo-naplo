<template>
  <Dialog :value="open" @input="onInput" title="Óra">
    <v-list>
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>
            {{ lesson.count }}. óra, {{ lesson.date | formatDate }};
            {{ lesson.startTime | formatTime }} -
            {{ lesson.endDate | formatDate }}
          </v-list-item-title>
          <v-list-item-subtitle>Időpont</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item :to="`/statistics/${lesson.subject}`"
        ><v-list-item-content>
          <v-list-item-title>{{ lesson.subject }}</v-list-item-title>
          <v-list-item-subtitle>Tantárgy</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ lesson.theme || '-' }}</v-list-item-title>
          <v-list-item-subtitle>Téma</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{
            lesson.deputyTeacher
              ? `Helyettesítő: ${lesson.deputyTeacher}`
              : lesson.teacher
          }}</v-list-item-title>
          <v-list-item-subtitle>Tanár</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ lesson.classRoom }}</v-list-item-title>
          <v-list-item-subtitle>Terem</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ lesson.homework || '-' }}</v-list-item-title>
          <v-list-item-subtitle>Házi</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ lesson.presenceTypeName }}</v-list-item-title>
          <v-list-item-subtitle>Jelenlét</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            v-html="
              getClassGroupTextFromUID(
                lesson.osztalyCsoportUid,
                osztalyCsoportok
              )
            "
          ></v-list-item-title>
          <v-list-item-subtitle> Osztálycsoport </v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
    </v-list>
  </Dialog>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import Dialog from './Dialog.vue';
import { Prop } from 'vue-property-decorator';
import { Lesson } from '../../api-types';
@Component({
  components: { Dialog },
})
export default class LessonDialog extends mixins(Mixin) {
  open = false;
  @Prop(Object) readonly lesson!: Lesson;
  mounted() {
    this.open = true;
  }
  beforeRouteLeave(_, __, next) {
    if (!this.open) {
      next();
      return;
    }
    this.open = false;
    this.$nextTick(() => {
      next();
    });
  }
  onInput(val) {
    if (val === false) {
      this.$nextTick(() => {
        this.$router.go(-1);
      });
    }
  }
}
</script>
