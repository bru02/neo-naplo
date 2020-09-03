<template>
  <v-container>
    <v-list>
      <v-list-item-group>
        <v-list-item
          v-for="(item, i) in stats"
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
</template>
<script lang="ts">
import Mixin from '@/mixins';
import { apiMapper } from '@/store';
import Component, { mixins } from 'vue-class-component';
import { Stat } from '../store/modules/api';

@Component({
  computed: apiMapper.mapGetters(['stats']),
  metaInfo: {
    title: 'Statisztikák'
  }
})
export default class Statistics extends mixins(Mixin) {
  stats!: Stat[];
}
</script>
