<template>
  <v-simple-table>
    <thead>
      <tr>
        <th class="text-left">Tantárgy</th>
        <th class="text-left" v-for="key in keys" :key="key">{{ key }}</th>
        <th class="text-left">Átlag</th>
        <template v-if="classAvgLoaded">
          <th class="text-left">Osztály átlag</th>
          <th class="text-left">Különbség</th>
        </template>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, subject) in evaluationsMatrix" :key="subject">
        <td>{{ subject }}</td>
        <td v-for="key in keys" :key="key">
          <v-tooltip
            bottom
            content-class="text-center"
            v-for="evaluation in item[key]"
            :key="evaluation.id"
          >
            <template v-slot:activator="{ on }">
              <span
                :class="getClasses(evaluation)"
                v-on="on"
                @click="$emit('input', evaluation)"
                >{{ evaluation.numberValue }}
              </span>
            </template>
            <span>
              {{ evaluation.date | formatDate }} <br />
              {{ evaluation.value }} <br />
              <template v-if="evaluation.mode">
                {{ evaluation.mode }} <br />
              </template>
              <template v-if="evaluation.theme">
                Téma: {{ evaluation.theme }} <br />
              </template>
              <template v-if="evaluation.weight && evaluation.weight != '-'">
                Súly: {{ evaluation.weight }} <br />
              </template>
              {{ evaluation.teacher }}
            </span>
          </v-tooltip>
        </td>
        <td
          :style="{
            color: getEvaluationColor(getAverage(groupedEvaluations[subject]))
          }"
        >
          {{ getAverage(groupedEvaluations[subject]) || '-' }}
        </td>
        <template v-if="classAvgLoaded">
          <td>{{ getClassAverage(subject) || '-' }}</td>
          <td :class="getDifferenceColor(subject)">
            {{ getDifference(subject) }}
          </td>
        </template>
      </tr>
    </tbody>
  </v-simple-table>
</template>
<script lang="ts">
import { utc2date } from '@/helpers';
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Evaluation, ClassAverage } from '../../api-types';
import { getAverage, getEvaluationTypeName } from '../../utils/evaluations';
import { apiMapper } from '../../store';
@Component({
  computed: apiMapper.mapState({
    classAvgLoaded: state => state.classAverages.loaded
  })
})
export default class EvaluationsTable extends mixins(Mixin) {
  @Prop(Array) readonly evaluations!: Evaluation[];
  @Prop() readonly groupedClassAverages!: { [k: string]: ClassAverage[] };
  @Prop() readonly groupedEvaluations!: { [k: string]: Evaluation[] };

  keys: (string | number)[] = [];
  get evaluationsMatrix(): {
    [subject: string]: { [key: string]: Evaluation[] };
  } {
    const ret = {},
      keys: string[] = [];
    for (const [subject, evaluations] of Object.entries(
      this.groupedEvaluations
    )) {
      const grouped = {};
      for (const evaluation of evaluations) {
        let key;
        if (evaluation.type === 'MidYear') {
          key = `0${utc2date(evaluation.date).getMonth() + 1}`.slice(-2);
        } else {
          key = getEvaluationTypeName(evaluation.type);
        }

        if (!(key in grouped)) {
          grouped[key] = [];
        }
        grouped[key].push(evaluation);
        keys.push(key);
      }
      ret[subject] = grouped;
    }
    this.keys = keys
      .filter((v, i, a) => {
        return a.indexOf(v) === i;
      })
      .reverse();
    return ret;
  }
  getClasses(evaluation) {
    return {
      'green--text': evaluation.mode === 'Beszámoló',
      'blue--text': evaluation.mode === 'Gyakorlati feladat',
      'red--text': evaluation.weight && evaluation.weight != '100%',
      'gray--text': evaluation.mode === 'Órai munka',
      'teal--text-lighten-2': evaluation.mode === 'Házi dolgozat',
      'font-weight-bold': evaluation.weight === '200%',
      eval: true
    };
  }
  getClassAverage(subject) {
    return this.groupedClassAverages[subject]
      ? this.groupedClassAverages[subject][0].value
      : null;
  }
  getDifference(subject) {
    if (
      !this.getClassAverage(subject) ||
      !getAverage(this.groupedEvaluations[subject])
    )
      return '-';
    return round(
      getAverage(this.groupedEvaluations[subject]) -
        // @ts-ignore
        this.getClassAverage(subject)
    );
  }
  getDifferenceColor(subject) {
    const diff = this.getDifference(subject);
    return diff === 0 ? '' : diff > 0 ? 'green--text' : 'red--text';
  }
}
function round(n) {
  return Math.round(100 * n) / 100;
}
</script>
<style>
.eval {
  cursor: pointer;
}
</style>
