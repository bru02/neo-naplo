<template>
  <v-container>
    <v-list>
      <template v-for="entry in absences">
        <v-list-item
          v-if="entry.items.length === 1"
          :key="entry.date"
          v-ripple
          @click="selectedAbsence = entry.items[0]"
        >
          <v-list-item-avatar>
            <v-icon
              :color="getAbsenceColor(entry.items[0].justificationState)"
              >{{ getIcon(entry) }}</v-icon
            >
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ entry.items[0].subject }}</v-list-item-title>
            <v-list-item-subtitle
              :style="{
                color: getAbsenceColor(entry.items[0].justificationState)
              }"
              >{{ entry.items[0].justificationStateName }}</v-list-item-subtitle
            >
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-action-text>
              {{ entry.items[0].date | formatDate }}
            </v-list-item-action-text>
            {{ entry.items[0].numberOfLessons }}.óra
          </v-list-item-action>
        </v-list-item>
        <v-list-group :key="entry.date" v-else no-action>
          <template v-slot:prependIcon>
            <v-icon
              :color="getAbsenceColor(entry.items[0].justificationState)"
              >{{ getIcon(entry) }}</v-icon
            >
          </template>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title
                >{{ entry.items[0].typeName }} ({{ entry.items.length }} db
                óra)</v-list-item-title
              >
            </v-list-item-content>

            <v-list-item-action>
              <v-list-item-action-text>
                {{ entry.date | formatDate }}
              </v-list-item-action-text>
            </v-list-item-action>
          </template>

          <v-list-item
            v-for="abs in entry.items"
            :key="abs.id"
            v-ripple
            @click="selectedAbsence = abs"
          >
            <v-list-item-content>
              <v-list-item-title>{{ abs.subject }}</v-list-item-title>
              <v-list-item-subtitle
                :style="{ color: getAbsenceColor(abs.justificationState) }"
                >{{ abs.justificationStateName }}</v-list-item-subtitle
              >
            </v-list-item-content>
            <v-list-item-action>
              {{ abs.numberOfLessons }}.óra
            </v-list-item-action>
          </v-list-item>
        </v-list-group>
      </template>
    </v-list>
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
import { Watch } from 'vue-property-decorator';

import Component, { mixins } from 'vue-class-component';
import { Absence } from '../api-types';
@Component({
  computed: {
    ...apiMapper.mapGetters(['absences', 'flatAbsences']),
    ...apiMapper.mapState({
      loading: state => state.general.loading
    })
  },
  components: { DataViewer },
  metaInfo: {
    title: 'Hiányzások'
  }
})
export default class AbsencesComponent extends mixins(Mixin) {
  selectedAbsence: Absence | boolean = false;
  flatAbsences!: Absence[];
  mounted() {
    this.obtain('general');
  }
  getIcon(entry) {
    return {
      Justified: 'mdi-check',
      BeJustified: 'mdi-help-circle-outline',
      UnJustified: 'mdi-close'
    }[entry.items[0].justificationState];
  }
  @Watch('selectedAbsence')
  onselectedNoteChange(value) {
    if (value) {
      if (!this.$route.params.id) this.$router.push(`/absences/${value.id}`);
    } else {
      if (this.$route.params.id) this.$router.push(`/absences`);
    }
  }
  @Watch('$route')
  onRouteChange() {
    const { id } = this.$route.params;
    if (id) {
      if (!this.selectedAbsence)
        this.selectedAbsence =
          this.flatAbsences.find(e => e.id === +id) ?? false;
    } else {
      this.selectedAbsence = false;
    }
  }
}
</script>
