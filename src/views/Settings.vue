<template>
  <v-container>
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Sötét mód</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-switch v-model="$vuetify.theme.dark"></v-switch>
        </v-list-item-action>
      </v-list-item>

      <v-list-item @click="colorsDialog = true">
        <v-list-item-content>
          <v-list-item-title>Színek testreszabása</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon> mdi-arrow-right </v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <Dialog title="Színek testreszabása" v-model="colorsDialog">
      <template v-slot:toolbar>
        <v-btn icon @click="$store.commit('settings/resetColors')">
          <v-icon> mdi-format-clear </v-icon>
        </v-btn>
      </template>
      <v-container>
        <v-sheet
          color="transparent"
          :elevation="0"
          width="100%"
          :height="20"
        ></v-sheet>
        <v-color-picker
          hide-inputs
          mode="hexa"
          v-model="color"
        ></v-color-picker>
        <v-list>
          <EvaluationListItem
            v-for="e in mocks"
            :key="e.numberValue"
            :eval="e"
            v-on:input="updateColor($event.numberValue)"
          >
            <template v-slot:action>
              <v-icon> mdi-format-color-fill </v-icon>
            </template>
          </EvaluationListItem>
        </v-list>
      </v-container>
    </Dialog>
  </v-container>
</template>
<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Mixin from '@/mixins';
import { Watch } from 'vue-property-decorator';
import { authMapper } from '@/store';
import Dialog from '../components/dialogs/Dialog.vue';
import EvaluationListItem from '../components/listItems/EvaluationListItem.vue';
import { getEvalValue } from '../utils/evaluations';

@Component({
  metaInfo: {
    title: 'Beállítások',
  },
  components: { Dialog, EvaluationListItem },
})
export default class SettingsComponent extends mixins(Mixin) {
  loading = false;
  colorsDialog = false;
  color = '#8ebc63';

  @Watch('$vuetify.theme.dark')
  onThemeChange(val: boolean) {
    localStorage.setItem('dark_theme', String(val));
  }
  get mocks() {
    return [1, 2, 3, 4, 5, null].map((e) => ({
      numberValue: e,
      subject: getEvalValue(e),
      date: new Date(),
    }));
  }
  updateColor(nv: number) {
    this.$store.commit('settings/updateColor', {
      key: nv || 'default',
      value: this.color,
    });
  }
}
</script>
