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
              ><span
                :style="{
                  color: getEvaluationColor(item.average)
                }"
                v-if="item.average"
                >{{ item.average }}</span
              >{{
                !!(item.average && item.absencesCount.text) ? ' &mdash; ' : ''
              }}
              <span
                :style="{
                  color: item.absencesCount.color
                }"
                >{{ item.absencesCount.text }}</span
              ></v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-container>

  <v-container v-else fluid>
    <v-skeleton-loader
      :loading="loading"
      type="card, list-item-avatar-three-line, list-item-avatar-two-line,list-item-avatar-two-line"
    >
      <v-card
        class="mx-auto"
        loading
        v-touch="{
          right: () => $router.go(-1)
        }"
      >
        <template v-slot:progress>
          <div class="stacked-bar-graph v-progress-linear">
            <span
              v-for="(c, i) in $store.state.settings.evaluationColors"
              :key="i"
              :style="{
                width: `${(bars[c] || 0) * 100}%`,
                background: c
              }"
            ></span>
          </div>
        </template>
        <v-img
          :src="
            require(`@/assets/resized/${getSubjectIcon(
              currentSubject.subjectCategoryName
            )}-xl.jpg`)
          "
          :srcset="
            getSrcset(getSubjectIcon(currentSubject.subjectCategoryName))
          "
          sizes="(max-width: 600px) 563px, (max-width: 960px) 900px, (max-width: 1264px) 1185px, 1785px"
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
                    class="avr"
                    :style="{
                      color: getEvaluationColor(currentSubject.average)
                    }"
                    >{{
                      getAverage([
                        ...currentSubject.evaluations,
                        ...(added[subject] || [])
                      ])
                    }}</span
                  >
                </div>
                <div v-if="currentSubject.classAverage">
                  Osztály átlag:
                  <span
                    class="avr"
                    :style="{
                      color: getEvaluationColor(currentSubject.classAverage)
                    }"
                    >{{ currentSubject.classAverage }}</span
                  >
                </div>
              </div>
            </v-card-title>
          </v-row>
        </v-img>
        <v-tabs v-model="active" v-if="!mobile && views.length > 1">
          <v-tab v-for="(view, i) in views" :key="i">
            {{ view.name }}
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="active">
          <v-tab-item
            v-if="
              currentSubject &&
                currentSubject.evaluations &&
                currentSubject.evaluations.length
            "
          >
            <v-list>
              <EvaluationListItem
                v-for="item in currentSubject.evaluations"
                :key="item.id"
                :eval="item"
                v-on:input="selectedEvaluation = $event"
              />

              <v-list-item
                v-for="(item, i) in added[subject] || []"
                :key="item.id"
              >
                <v-list-item-avatar>
                  {{ item.numberValue }}
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="subject"></v-list-item-title>
                  <v-list-item-subtitle
                    v-text="item.weight"
                  ></v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon color="red" @click="$delete(added[subject], i)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-divider inset></v-divider>
              <v-list-item v-for="(evals, nv) in csebv" :key="nv">
                <v-list-item-content>
                  <v-list-item-title>{{ evals.length }} db</v-list-item-title>
                  <v-list-item-subtitle
                    :style="{ color: getEvaluationColor(nv) }"
                    >{{ evals[0].value }}</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-show="views.length == 2 && mobile"></v-list-item>
            </v-list>
          </v-tab-item>
          <v-tab-item
            v-if="
              currentSubject &&
                currentSubject.absences &&
                currentSubject.absences.length
            "
          >
            <v-list two-line>
              <v-list-item
                v-for="abs in currentSubject.absences"
                v-ripple
                :key="abs.id"
                @click="selectedAbsence = abs"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ abs.subject }}</v-list-item-title>
                  <v-list-item-subtitle
                    :style="{
                      color: getAbsenceColor(abs.justificationState)
                    }"
                    >{{ abs.justificationStateName }}</v-list-item-subtitle
                  >
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-action-text>{{
                    abs.date | formatDate
                  }}</v-list-item-action-text
                  >{{ abs.numberOfLessons }}.óra
                </v-list-item-action>
              </v-list-item>
              <v-divider inset></v-divider>
              <v-list-item
                v-for="(absences, type) in currentSubject.absencesCount
                  .absencesByJustification"
                :key="type"
              >
                <v-list-item-content>
                  <v-list-item-title
                    >{{ absences.length }} db</v-list-item-title
                  >
                  <v-list-item-subtitle
                    :style="{
                      color: getAbsenceColor(type)
                    }"
                    >{{
                      absences[0].justificationStateName
                    }}</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title
                    >{{ sumAbsences }} óra{{ delayText }}</v-list-item-title
                  >
                  <v-list-item-subtitle :style="{ color: sumAbsencesColor }"
                    >Összes hiányzás</v-list-item-subtitle
                  >
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-show="views.length == 2 && mobile"></v-list-item>
            </v-list>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-skeleton-loader>
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
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template v-slot:activator="{ on }">
        <v-fab-transition>
          <v-btn
            v-show="
              currentSubject &&
                currentSubject.evaluations.length > 0 &&
                active == 0
            "
            color="red"
            dark
            fixed
            bottom
            right
            fab
            v-on="on"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-fab-transition>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">Milenne ha kapnék egy..</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-radio-group v-model="numberValue" row>
              <v-radio
                v-for="(e, i) in new Array(5)"
                :label="i + 1 + ''"
                :value="i + 1"
                :key="i"
              ></v-radio>
            </v-radio-group>
            <hr />
            <v-radio-group v-model="weight" row>
              <v-radio label="50%" value="50%"></v-radio>
              <v-radio label="100%" value="100%"></v-radio>
              <v-radio label="200%" value="200%"></v-radio>
            </v-radio-group>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false"
            >Mégse</v-btn
          >
          <v-btn
            color="blue darken-1"
            text
            @click="
              dialog = false;
              addEval();
            "
            >Hozzáadás</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import Vue from 'vue';
import AbsencesList from '@/components/dataviews/AbsencesList.vue';
import EvaluationListItem from '@/components/listItems/EvaluationListItem.vue';
import VTouch from 'vuetify/lib/directives/touch';
import { Watch } from 'vue-property-decorator';

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
  directives: { touch: VTouch },
  computed: apiMapper.mapGetters([
    'evaluations',
    'groupedEvaluations',
    'absences',
    'groupedClassAverages',
    'flatAbsences'
  ]),
  components: { DataViewer, AbsencesList, EvaluationListItem },
  metaInfo: {
    title: 'Statisztikák'
  }
})
export default class Statistics extends mixins(Mixin) {
  @Prop({ default: false }) subject!: string;
  evaluations!: Evaluation[];
  absences!: AbsenceGroup[];
  groupedClassAverages!: { [k: string]: ClassAverage[] };
  groupedEvaluations!: { [k: string]: Evaluation[] };
  flatAbsences!: Absence[];
  active = 0;
  added = {};
  numberValue = 5;
  weight = '100%';
  dialog = false;
  selectedAbsence = false;
  selectedEvaluation = false;
  loading = true;
  mounted() {
    this.obtain('general').then(() => (this.loading = false));
    this.obtain('classAverages');
  }

  get values() {
    const subjects = [
      ...Object.keys(this.groupedAbsences),
      ...Object.keys(this.groupedEvaluations)
    ].filter((e, i, a) => a.indexOf(e) == i);
    const ret: Stat[] = [];
    for (const subject of subjects) {
      const absences = this.groupedAbsences[subject] ?? [],
        evaluations = this.groupedEvaluations[subject] ?? [];
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
      absences: this.flatAbsences,
      evaluations: this.evaluations,
      average: this.getAverage(this.evaluations),
      classAverage: null,
      absencesCount: this.getAbsencesCount(this.flatAbsences),
      subject: 'Összes tantárgy',
      subjectCategoryName: 'Összes tantárgy'
    });
    return ret;
  }
  addEval() {
    if (!(this.subject in this.added)) Vue.set(this.added, this.subject, []);
    this.added[this.subject].push({
      numberValue: this.numberValue,
      // @ts-ignore
      weight: this.weight,
      subject: this.subject,
      id: +new Date(),
      isAtlagbaBeleszamit: true,
      form: 'Mark'
    });
  }

  getSrcset(name) {
    const sizes = {
      sm: 563,
      md: 900,
      lg: 1185,
      xl: 1785
    };
    return Object.entries(sizes)
      .map(
        ([size, width]) =>
          `${require(`@/assets/resized/${name}-${size}.jpg`)} ${width}w`
      )
      .join(',');
  }

  get currentSubject() {
    for (const stat of this.values) {
      if (stat.subject == this.subject) return stat;
    }
    return {} as any;
  }

  get groupedAbsences(): { [k: string]: Absence[] } {
    return this.group(this.flatAbsences, 'subject');
  }

  get csebv() {
    // Kell a cache
    return this.group(
      this.currentSubject.evaluations.filter(
        (e: Evaluation) => e.isAtlagbaBeleszamit && e.form == 'Mark'
      ),
      'numberValue'
    );
  }

  get bars() {
    const ret: { [k: string]: number } = {};
    if (this.active == 1) {
      const sum = this.currentSubject.absences.length;
      for (const type in this.currentSubject.absencesCount
        .absencesByJustification) {
        // @ts-ignore
        ret[this.getAbsenceColor(type)] =
          this.currentSubject.absencesCount.absencesByJustification[type]
            .length / sum;
      }
    } else {
      const sum = this.currentSubject.evaluations.filter(
        (e: Evaluation) => e.isAtlagbaBeleszamit && e.form == 'Mark'
      ).length;
      for (const val in this.csebv) {
        ret[this.getEvaluationColor(+val)] = this.csebv[val].length / sum;
      }
    }
    return ret;
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

  get sumAbsences() {
    return (
      this.currentSubject?.absences.filter(e => e.type == 'Absence').length ?? 0
    );
  }

  get sumAbsencesColor() {
    const R = Math.min(200, (this.sumAbsences / 125) * 200);
    const G = Math.min(
      200,
      Math.max(0, 200 - ((this.sumAbsences - 125) / 125) * 200)
    );
    return `rgb(${R}, ${G}, 0)`;
  }

  get delayText() {
    const MILLISECONDS_MINUTE = 60 * 1000;
    const MILLISECONDS_HOUR = 60 * MILLISECONDS_MINUTE;

    let ht = '',
      delaySum = 0;
    for (const abs of this.currentSubject.absences) {
      if (abs.type == 'Delay') {
        delaySum += abs.delay;
      }
    }
    if (delaySum == 0) return '';
    if (delaySum > MILLISECONDS_HOUR) {
      ht = `${Math.floor(delaySum / MILLISECONDS_HOUR)} óra és `;
    }

    return ` + ${ht}${Math.floor(
      (delaySum % MILLISECONDS_HOUR) / MILLISECONDS_MINUTE
    )} perc késés`;
  }
  @Watch('selectedEvaluation')
  onselectedEvalChange(value) {
    if (value) {
      if (!this.$route.params.id)
        this.$router.push(`/statistics/${this.subject}/evaluation/${value.id}`);
    } else {
      if (this.$route.params.type)
        this.$router.push(`/statistics/${this.subject}`);
    }
  }
  @Watch('selectedAbsence')
  onselectedAbsenceChange(value) {
    if (value) {
      if (!this.$route.params.id)
        this.$router.push(`/statistics/${this.subject}/absence/${value.id}`);
    } else {
      if (this.$route.params.type)
        this.$router.push(`/statistics/${this.subject}`);
    }
  }
  @Watch('dialog')
  onDialogChange(value) {
    if (value) {
      if (!this.$route.params.type)
        this.$router.push(`/statistics/${this.subject}/add`);
    } else {
      if (this.$route.params.type)
        this.$router.push(`/statistics/${this.subject}`);
    }
  }
  @Watch('$route')
  onRouteChange() {
    const { type, id } = this.$route.params;
    switch (type) {
      case 'evaluation':
        if (!this.selectedEvaluation)
          this.selectedEvaluation =
            (this.currentSubject?.evaluations ?? []).find(e => e.id === +id) ??
            false;
        break;
      case 'absence':
        if (!this.selectedAbsence)
          this.selectedAbsence =
            (this.currentSubject?.absences ?? []).find(e => e.id === +id) ??
            false;
        break;

      case 'add':
        this.dialog = true;
        break;

      default:
        this.selectedAbsence = false;
        this.selectedEvaluation = false;
        this.dialog = false;
        break;
    }
  }
}
</script>
<style lang="scss">
.stacked-bar-graph {
  width: 100%;
  height: 4px;
  span {
    height: 100%;
    box-sizing: border-box;
    transition: width 0.4s ease-in-out;
    float: left;
  }
}
.avr::after {
  background-color: #565656;
  content: '';
  position: absolute;
  top: -3px;
  left: -5px;
  width: 110%;
  border-radius: 4px;
  opacity: 0.4;
  height: 100%;
  z-index: -1;
  margin: 3px;
}
.avr {
  position: relative;
}
</style>
