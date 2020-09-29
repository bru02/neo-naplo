<template>
  <v-card
    :color="getAbsenceColor(absences[0].justificationState)"
    :dark="isDark(getAbsenceColor(absences[0].justificationState))"
    @click.native="
      absences.length === 1
        ? $emit('input', absences[0].id)
        : $emit('absences', absences)
    "
  >
    <v-card-title primary-title>
      {{
        absences.length === 1 ? absences[0].subject : `${absences.length} db`
      }}
    </v-card-title>
    <v-card-subtitle>
      {{ absences[0].justificationStateName }}
    </v-card-subtitle>
    <v-divider light></v-divider>
    <v-card-actions class="pa-3">
      {{ absences[0].typeName }}
      <v-spacer></v-spacer>
      {{ absences[0].date | formatDate }}
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Absence } from '../../api-types';

@Component
export default class AbsencesCard extends mixins(Mixin) {
  @Prop() readonly absences: Absence[] | undefined;
}
</script>
