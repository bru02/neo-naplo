<template>
  <v-card color="blue-grey" dark @click.native="$emit('input', exam)">
    <v-card-title primary-title>
      {{ exam.name }}
    </v-card-title>
    <v-card-subtitle>
      <div>{{ trimText(exam.subject) }}</div>
      <div class="font-weight-thin">{{ exam.teacher }}</div>
    </v-card-subtitle>
    <v-divider light></v-divider>
    <v-card-actions class="pa-3">
      {{ exam.type }}
      <v-spacer></v-spacer>
      {{ exam.date | formatDate }}, {{ exam.count }}. óra
    </v-card-actions>
  </v-card>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Exam } from '../../api-types';

@Component
export default class ExamCard extends mixins(Mixin) {
  @Prop() readonly exam!: Exam;
}
</script>
