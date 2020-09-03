<template>
  <Dialog :value="open" @input="onInput" title="Mulasztás">
    <v-list>
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>
            {{
              abs.typeName +
                (abs.type === 'Delay' ? `(${abs.delayTimeMinutes} perc)` : '')
            }}
          </v-list-item-title>
          <v-list-item-subtitle>Típus</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item :to="`/statistics/${abs.subject}`"
        ><v-list-item-content>
          <v-list-item-title>{{ abs.subject }}</v-list-item-title>
          <v-list-item-subtitle>Tantárgy</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            >{{ abs.date | formatDate }}; {{ abs.numberOfLessons }}.
            óra</v-list-item-title
          >
          <v-list-item-subtitle>Dátum</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ abs.teacher }}</v-list-item-title>
          <v-list-item-subtitle>Tanár</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            >{{ abs.creatingTime | formatDate }},
            {{ abs.creatingTime | formatTime }}</v-list-item-title
          >
          <v-list-item-subtitle>Naplózás dátuma</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            v-html="
              getClassGroupTextFromUID(abs.osztalyCsoportUid, osztalyCsoportok)
            "
          ></v-list-item-title>
          <v-list-item-subtitle>
            Osztálycsoport
          </v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item :to="lessonUrl"
        ><v-list-item-content>
          <v-list-item-title>Óra megtekintése</v-list-item-title>
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
import { Absence } from '../../api-types';
import { getLessonUrl } from '../../helpers';
@Component({
  components: { Dialog }
})
export default class AbsenceDialog extends mixins(Mixin) {
  open = false;
  @Prop(Object) readonly abs!: Absence;
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
  get lessonUrl() {
    const { date, numberOfLessons } = this.abs;
    return getLessonUrl(date, numberOfLessons);
  }
}
</script>
