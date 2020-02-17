<template>
  <v-list two-line>
    <v-list-item
      v-for="abs in absences"
      v-ripple
      :key="abs.id"
      @click="
        abs.items.length === 1
          ? $emit('lesson', abs.items[0])
          : $emit('input', abs)
      "
    >
      <v-list-item-content>
        <v-list-item-title>{{ abs.subject }}</v-list-item-title>
        <v-list-item-subtitle
          v-bind:class="[`${getAbsenceColor(abs.justificationState)}--text`]"
          >{{ abs.justificationStateName }}</v-list-item-subtitle
        >
      </v-list-item-content>
      <v-list-item-action> {{ abs.numberOfLessons }}.óra </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Absence } from '../../api-types';
@Component
export default class AbsencesList extends mixins(Mixin) {
  @Prop() readonly absences: Absence[] | undefined;
}
</script>
