<template>
  <v-container>
    <v-list>
      <v-list-item
        v-for="exam in exams"
        :key="exam.id"
        @click="selectedExam = exam"
      >
        <v-list-item-content>
          <v-list-item-title>{{ exam.name }}</v-list-item-title>
          <v-list-item-subtitle>
            <span class="text--primary">{{ exam.subject }}</span> &mdash;
            {{ exam.type }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-list-item-action-text>
            {{ exam.date | formatDate }}, {{ exam.count }}. óra
          </v-list-item-action-text>
        </v-list-item-action>
      </v-list-item>
      <v-alert value type="info" v-show="exams.length === 0 && !loading"
        >Nincs itt semmi..</v-alert
      >
    </v-list>
  </v-container>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import { apiMapper } from '@/store';
import Component, { mixins } from 'vue-class-component';
import { Exam } from '../api-types';

@Component({
  computed: apiMapper.mapState({
    exams: (state) => state.exams.data,
    loading: (state) => state.exams.loading,
  }),
  metaInfo: {
    title: 'Számonkérések',
  },
})
export default class ExamsComponent extends mixins(Mixin) {
  exams!: Exam[];
  mounted() {
    this.obtain('exams');
  }
}
</script>
