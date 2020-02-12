<template>
  <v-card
    :color="getAbsenceColor(absences.items[0].justificationState)"
    dark
    @click.native="$emit('input', absences)"
  >
    <!-- <v-layout align-center justify-center>
      <v-flex xs12> -->
    <v-card-title primary-title>
      {{
        absences.items.length === 1
          ? absences.items[0].subject
          : `${absences.items.length} db`
      }}
    </v-card-title>
    <v-card-subtitle>
      <!-- <div> -->
      {{ absences.items[0].justificationStateName }}
      <!-- </div> -->
    </v-card-subtitle>
    <!-- </v-flex>
    </v-layout> -->
    <v-divider light></v-divider>
    <v-card-actions class="pa-3">
      {{ absences.items[0].typeName }}
      <v-spacer></v-spacer>
      {{ absences.date | formatDate }}
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component
export default class AbsencesCard extends mixins(Mixin) {
  @Prop() readonly absences: any[] | undefined;
}
</script>
