<template>
  <v-container>
    <v-expansion-panels>
      <v-progress-linear
        v-show="false"
        :indeterminate="false"
      ></v-progress-linear>
      <v-expansion-panel v-for="entry in absences" :key="entry.date">
        <v-expansion-panel-header v-ripple>
          <div>
            {{ entry.items[0].typeName }} ({{ entry.items.length }} db óra)
            <span style="float: right">{{ entry.date | formatDate }}</span>
          </div>
          <template v-slot:actions>
            <v-icon
              :class="[
                `${getAbsenceColor(entry.items[0].justificationState)}--text`
              ]"
              >{{
                {
                  Justified: 'mdi-check',
                  BeJustified: 'mdi-help-circle-outline',
                  UnJustified: 'mdi-close'
                }[entry.items[0].justificationState]
              }}</v-icon
            >
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <AbsencesList :absences="entry.items" v-model="selectedAbsence" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-alert
      :value="true"
      type="info"
      v-show="absences.length == 0 && !loading"
    >
      Még nem hiányoztál
    </v-alert>
    <DataViewer
      v-model="selectedAbsence"
      title="Mulasztás"
      :fn="absenceValues"
    />
  </v-container>
</template>

<script lang="ts">
import { apiMapper } from '@/store';
import Mixin from '@/mixins';
import DataViewer from '@/components/DataViewer.vue';
import AbsencesList from '@/components/dataviews/AbsencesList.vue';

import Component, { mixins } from 'vue-class-component';
import { Absence } from '../api-types';
@Component({
  computed: {
    ...apiMapper.mapGetters(['absences']),
    ...apiMapper.mapState({
      loading: state => state.general.loading
    })
  },
  components: { AbsencesList, DataViewer }
})
export default class AbsencesComponent extends mixins(Mixin) {
  name = 'Hiányzások';
  selectedAbsence: Absence | boolean = false;
  mounted() {
    this.obtain('general');
  }
  metaInfo = {
    title: 'Hiányzások'
  };
}
</script>
