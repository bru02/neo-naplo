<template>
  <Dialog :value="open" @input="onInput" title="Számonkérés">
    <v-list>
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            >{{ exam.count }}. óra,
            {{ exam.date | formatDate }}</v-list-item-title
          >
          <v-list-item-subtitle>Időpont</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ exam.name }}</v-list-item-title>
          <v-list-item-subtitle>Téma</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ exam.type }}</v-list-item-title>
          <v-list-item-subtitle>Típus</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ exam.date | formatDate }}</v-list-item-title>
          <v-list-item-subtitle>Dátum</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ exam.teacher }}</v-list-item-title>
          <v-list-item-subtitle>Tanár</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            >{{ exam.creatingTime | formatDate }},
            {{ exam.creatingTime | formatTime }}</v-list-item-title
          >
          <v-list-item-subtitle>Naplózás dátuma</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            v-html="
              getClassGroupTextFromUID(exam.osztalyCsoportUid, osztalyCsoportok)
            "
          ></v-list-item-title>
          <v-list-item-subtitle>
            Osztálycsoport
          </v-list-item-subtitle>
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
import { Exam } from '../../api-types';
@Component({
  components: { Dialog },
})
export default class ExamDialog extends mixins(Mixin) {
  open = false;
  @Prop(Object) readonly exam!: Exam;
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
