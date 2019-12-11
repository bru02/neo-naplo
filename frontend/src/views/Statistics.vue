<template>
<v-container v-if="!subject">
    <v-list>
    <v-list-item-group>
      <v-list-item
        v-for="(item, i) in values"
        :key="i"
        :to="`/statistics/${item.subject}`"
      >
        <v-list-item-icon>
          <v-icon>{{ getSubjectIcon(item.subjectCategoryName) }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ item.subject }}</v-list-item-title>
          <v-list-item-subtitle
            >{{ (item.average && `${item.average} &dash;`) || '' }}
            <span :class="[`${item.absencesCount.color}--text`]">{{
              item.absencesCount.text
            }}</span></v-list-item-subtitle
          >
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</v-container>

  <v-container v-else fluid>
    <v-card class="mx-auto">
      <v-img
        :src="
          require(`@/assets/subject-bg/${getSubjectIcon(
            currentSubject.subjectCategoryName
          )}.jpg?vuetify-preload`)
        "
        height="300px"
        dark
      >
        <v-row class="fill-height">
          <v-card-title>
            <v-btn dark icon to="/statistics">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-card-title>

          <v-spacer></v-spacer>

          <v-card-title class="white--text pl-12 pt-12">
            <div class="pl-12 pt-12">
              <div class="display-1">{{ currentSubject.subject }}</div>
              <div v-if="currentSubject.average">
                Átlag:
                <span
                  :class="[
                    `${getEvaluationColor(currentSubject.average)}--text`
                  ]"
                  >{{ currentSubject.average }}</span
                >
              </div>
              <div v-if="currentSubject.classAverage">
                Osztály átlag:
                <span
                  :class="[
                    `${getEvaluationColor(currentSubject.classAverage)}--text`
                  ]"
                  >{{ currentSubject.classAverage }}</span
                >
              </div>
            </div>
          </v-card-title>
        </v-row>
      </v-img>
      <v-tabs v-model="active">
        <template v-if="!mobile">
          <v-tab v-for="(view, i) in views" :key="i">
            {{ view.name }}
          </v-tab>
        </template>

        <v-tab-item v-if="currentSubject.evaluations.length">
          <v-list>
            <v-list-item
              v-for="item in currentSubject.evaluations"
              :key="item.creatingTime"
              @click="selectedEvaluation = item"
            >
              <v-list-item-avatar>
                {{ item.numberValue }}
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title v-text="item.subject"></v-list-item-title>
                <v-list-item-subtitle
                  v-text="item.theme"
                ></v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                {{ formatDate(item.date) }}
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-tab-item>
        <v-tab-item v-if="currentSubject.absences.length">
          <AbsencesList
            :absences="currentSubject.absences"
            v-model="selectedAbsence"
            :showDate="true"
          />
        </v-tab-item>
      </v-tabs>
    </v-card>
    <v-bottom-navigation
      fixed
      v-model="active"
      dark
      v-if="mobile"
      v-show="views.length > 1"
    >
      <v-btn v-for="(view, i) in views" :key="i">
        <span>{{ view.name }}</span>
        <v-icon>{{ view.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
    <DataViewer
      title="Mulasztás"
      :fn="absenceValues"
      v-model="selectedAbsence"
    />
    <DataViewer
      title="Értékelés"
      :fn="evalValues"
      v-model="selectedEvaluation"
    />
  </v-container>
</template>
<script lang="ts">
import {
  Evaluation,
  Absence,
  AbsenceGroup,
  JustificationState,
  ClassAverage
} from '@/api-types';
import Mixin from '@/mixins';
import { apiMapper } from '@/store';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import DataViewer from '@/components/DataViewer.vue';
import AbsencesList from '@/components/dataviews/AbsencesList.vue';

interface Stat {
  evaluations: Evaluation[];
  absences: Absence[];
  average: number | null;
  classAverage: number | null;
  absencesCount: { color: string; absencesByJustification: any; text: string };
  subject: string;
  subjectCategoryName: string;
}
@Component({
  computed: apiMapper.mapGetters([
    'evaluations',
    'groupedEvaluations',
    'absences',
    'groupedClassAverages'
  ]),
  components: { DataViewer, AbsencesList }
})
export default class Statistics extends mixins(Mixin) {
  name = 'Statisztikák'
  @Prop({ default: false }) subject!: string;
  evaluations!: Evaluation[];
  absences!: AbsenceGroup[];
  groupedClassAverages!: { [k: string]: ClassAverage[] };
  groupedEvaluations!: { [k: string]: Evaluation[] };

  active = 0;

  selectedAbsence = false;
  selectedEvaluation = false;

  mounted() {
    this.obtain('general');
  }

  get values() {
    const subjects = [
      ...Object.keys(this.groupedAbsences),
      ...Object.keys(this.groupedEvaluations)
    ].filter((e, i, a) => a.indexOf(e) == i);
    const ret: Stat[] = [];
    for (const subject of subjects) {
      const absences = this.groupedAbsences[subject] || [],
        evaluations = this.groupedEvaluations[subject] || [];
      ret.push({
        absences,
        evaluations,
        average: this.getAverage(evaluations),
        classAverage: this.groupedClassAverages[subject]
          ? this.groupedClassAverages[subject][0].value
          : null,
        absencesCount: this.getAbsencesCount(absences),
        subject,
        subjectCategoryName: (absences.length ? absences : evaluations)[0]
          .subjectCategoryName
      });
    }
    ret.push({
      absences: this.absencesList,
      evaluations: this.evaluations,
      average: this.getAverage(this.evaluations),
      classAverage: null,
      absencesCount: this.getAbsencesCount(this.absencesList),
      subject: 'Összes tantárgy',
      subjectCategoryName: 'Összes tantárgy'
    });
    return ret;
  }

  get currentSubject() {
    for (const stat of this.values) {
      if (stat.subject == this.subject) return stat;
    }
    return null;
  }

  get groupedAbsences(): { [k: string]: Absence[] } {
    return this.group(this.absencesList, 'subject');
  }

  get absencesList() {
    return this.absences.map(ag => ag.items).flatMap(a => a);
  }

  getAbsencesCount(absences: Absence[]) {
    const absencesByJustification = this.group(absences, 'justificationState');
    if (absencesByJustification.UnJustified) {
      return {
        color: 'red',
        text: `${absencesByJustification.UnJustified.length} igazolatlan hiányzás`,
        absencesByJustification
      };
    }
    if (absencesByJustification.BeJustified) {
      return {
        color: 'orange',
        text: `${absencesByJustification.BeJustified.length} igazolandó hiányzás`,
        absencesByJustification
      };
    }
    if (absencesByJustification.Justified) {
      return {
        color: 'green',
        text: `${absencesByJustification.Justified.length} igazolt hiányzás`,
        absencesByJustification
      };
    }
    return {
      color: '',
      text: '',
      absencesByJustification
    };
  }

  get views() {
    const ret: { icon: string; name: string }[] = [];
    if (this.currentSubject) {
      if (this.currentSubject.evaluations.length) {
        ret.push({ icon: 'mdi-calendar-check-outline', name: 'Jegyek' });
      }
      if (this.currentSubject.absences.length) {
        ret.push({ icon: 'mdi-block-helper', name: 'Hiányzások' });
      }
    }
    return ret;
  }
  metaInfo = {
    title: 'Statisztikák'
  };
}
</script>
