<template>
  <v-container>
    <v-list>
      <template v-for="(abs, date) in groupedAbsences">
        <v-list-item
          v-if="abs.length === 1"
          :key="date"
          v-ripple
          @click="selectedAbsence = abs[0]"
        >
          <v-list-item-avatar>
            <v-icon :color="getAbsenceColor(abs[0].justificationState)">{{
              getIcon(abs)
            }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ abs[0].subject }}</v-list-item-title>
            <v-list-item-subtitle
              :style="{
                color: getAbsenceColor(abs[0].justificationState),
              }"
              >{{ abs[0].justificationStateName }}</v-list-item-subtitle
            >
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-action-text>{{
              date | formatDate
            }}</v-list-item-action-text>
            {{ abs[0].numberOfLessons }}.óra
          </v-list-item-action>
        </v-list-item>
        <v-list-group :key="date" v-else no-action>
          <template v-slot:prependIcon>
            <v-icon :color="getAbsenceColor(getJustificationState(abs))">{{
              getIcon(abs)
            }}</v-icon>
          </template>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>
                {{ abs[0].typeName }} ({{ abs.length }} db óra)
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-list-item-action-text>{{
                date | formatDate
              }}</v-list-item-action-text>
            </v-list-item-action>
          </template>

          <v-list-item
            v-for="a in abs"
            :key="a.id"
            v-ripple
            @click="selectedAbsence = a"
          >
            <v-list-item-content>
              <v-list-item-title>{{ a.subject }}</v-list-item-title>
              <v-list-item-subtitle
                :style="{ color: getAbsenceColor(a.justificationState) }"
                >{{ a.justificationStateName }}</v-list-item-subtitle
              >
            </v-list-item-content>
            <v-list-item-action>{{ a.numberOfLessons }}.óra</v-list-item-action>
          </v-list-item>
        </v-list-group>
      </template>
    </v-list>
    <v-alert value type="info" v-show="absences.length === 0 && !loading"
      >Még nem hiányoztál</v-alert
    >
    <router-view></router-view>
  </v-container>
</template>

<script lang="ts">
import { apiMapper } from '@/store';
import Mixin from '@/mixins';
import { Watch } from 'vue-property-decorator';

import Component, { mixins } from 'vue-class-component';
import { Absence } from '../api-types';
@Component({
  computed: {
    ...apiMapper.mapGetters(['absences', 'groupedAbsences']),
    ...apiMapper.mapState({
      loading: (state) => state.general.loading,
    }),
  },
  metaInfo: {
    title: 'Hiányzások',
  },
})
export default class AbsencesComponent extends mixins(Mixin) {
  selectedAbsence: Absence | boolean = false;
  absences!: Absence[];
  groupedAbsences!: { [date: number]: Absence[] };

  mounted() {
    this.obtain('general');
  }
  getJustificationState(absences) {
    let type = absences[0].justificationState;
    if (absences.length === 1) return type;
    for (let i = 1; i < absences.length; i++) {
      if (absences[i].justificationState !== type) {
        type = 'Mixed';
        break;
      }
    }
    return type;
  }
  getIcon(abs) {
    return {
      Justified: 'mdi-check',
      BeJustified: 'mdi-help-circle-outline',
      UnJustified: 'mdi-close',
      Mixed: 'mdi-help',
    }[this.getJustificationState(abs)];
  }
}
</script>
