<template>
  <Dialog :value="open" @input="onInput" title="Feljegyzés">
    <v-list>
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title v-html="formatText(note.content)" />
          <v-list-item-subtitle>Tartalom</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ note.title }}</v-list-item-title>
          <v-list-item-subtitle>Cím</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ note.date | formatDate }}</v-list-item-title>
          <v-list-item-subtitle>Dátum</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ note.teacher }}</v-list-item-title>
          <v-list-item-subtitle>Tanár</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            >{{ note.creatingTime | formatDate }},
            {{ note.creatingTime | formatTime }}</v-list-item-title
          >
          <v-list-item-subtitle>Naplózás dátuma</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            v-html="
              getClassGroupTextFromUID(note.osztalyCsoportUid, osztalyCsoportok)
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
import { Note } from '../../api-types';
@Component({
  components: { Dialog },
})
export default class NoteDialog extends mixins(Mixin) {
  open = false;
  @Prop(Object) readonly note!: Note;
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
