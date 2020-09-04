<template>
  <Dialog :value="open" @input="onInput" title="Értékelés">
    <v-list>
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            >{{ eval.value }}
            {{
              eval.weight && eval.weight != '-' ? `(${eval.weight})` : ''
            }}</v-list-item-title
          >
          <v-list-item-subtitle>Értékelés</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ eval.theme }}</v-list-item-title>
          <v-list-item-subtitle>Téma</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ eval.typeName }}</v-list-item-title>
          <v-list-item-subtitle>Típus</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item v-if="impact !== false"
        ><v-list-item-content>
          <v-list-item-title
            :class="[
              impact === 0 ? '' : impact > 0 ? 'green--text' : 'red--text',
            ]"
            >{{ impact }}</v-list-item-title
          >
          <v-list-item-subtitle>Hatás az átlagodra</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item :to="`/statistics/${eval.subject}`"
        ><v-list-item-content>
          <v-list-item-title>{{ eval.subject }}</v-list-item-title>
          <v-list-item-subtitle>Tantárgy</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ eval.mode }}</v-list-item-title>
          <v-list-item-subtitle>Mód</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >

      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ eval.date | formatDate }}</v-list-item-title>
          <v-list-item-subtitle>Dátum</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ eval.teacher }}</v-list-item-title>
          <v-list-item-subtitle>Tanár</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            >{{ eval.creatingTime | formatDate }},
            {{ eval.creatingTime | formatTime }}</v-list-item-title
          >
          <v-list-item-subtitle>Naplózás dátuma</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title
            v-html="
              getClassGroupTextFromUID(eval.osztalyCsoportUid, osztalyCsoportok)
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
import { Evaluation } from '../../api-types';
import { getAverage } from '../../utils/evaluations';
@Component({
  components: { Dialog },
})
export default class EvaluationDialog extends mixins(Mixin) {
  open = false;
  @Prop(Object) readonly eval!: Evaluation;
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
  get impact() {
    if (this.eval.isAtlagbaBeleszamit && this.eval.form === 'Mark') {
      const evals = this.$store.getters['api/groupedEvaluations'][
        this.eval.subject
      ];
      const others = [...evals];
      others.splice(others.indexOf(eval), 1);
      return Math.round(100 * (getAverage(evals) - getAverage(others))) / 100;
    }
    return false;
  }
}
</script>
