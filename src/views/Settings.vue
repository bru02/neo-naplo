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

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Értesítések</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }"
              ><div v-on="supportText && on">
                <v-switch
                  :disabled="!!supportText"
                  v-on:change="toggle()"
                  :loading="loading"
                  :input-value="notificationsEnabled"
                ></v-switch>
              </div>
            </template>
            <span>{{ supportText }}</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
      <v-list-item @click="colorsDialog = true">
        <v-list-item-content>
          <v-list-item-title>Színek testreszabása</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon>
            mdi-arrow-right
          </v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <Dialog title="Színek testreszabása" v-model="colorsDialog">
      <template v-slot:toolbar>
        <v-btn icon @click="$store.commit('settings/resetColors')">
          <v-icon>
            mdi-format-clear
          </v-icon>
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
              <v-icon>
                mdi-format-color-fill
              </v-icon>
            </template>
          </EvaluationListItem>
        </v-list>
      </v-container>
    </Dialog>
    <v-snackbar v-model="toast" color="success">
      <v-icon>
        {{
          notificationsEnabled
            ? 'mdi-bell-ring-outline'
            : 'mdi-bell-off-outline'
        }}
      </v-icon>
      Értesítések {{ notificationsEnabled ? 'be' : 'ki' }}kapcsolva!
      <v-btn icon @click="toast = false">
        <v-icon>
          mdi-close
        </v-icon>
      </v-btn>
    </v-snackbar>
    <v-snackbar v-model="errorToast" color="error">
      <v-icon>
        mdi-bell-alert-outline
      </v-icon>
      Hiba az értesítések {{ notificationsEnabled ? 'be' : 'ki' }}kapcsolásánál!
      <v-btn icon @click="toast = false">
        <v-icon>
          mdi-close
        </v-icon>
      </v-btn>
    </v-snackbar>
  </v-container>
</template>
<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import Mixin from '@/mixins';
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import { Watch } from 'vue-property-decorator';
import { settingsMapper, authMapper } from '@/store';
import Dialog from '../components/dialogs/Dialog.vue';
import EvaluationListItem from '../components/listItems/EvaluationListItem.vue';
import { getEvalValue } from '../utils/evaluations';

@Component({
  metaInfo: {
    title: 'Beállítások'
  },
  computed: {
    ...settingsMapper.mapGetters(['notificationsEnabled']),
    ...authMapper.mapGetters(['tokenData'])
  },
  components: { Dialog, EvaluationListItem }
})
export default class SettingsComponent extends mixins(Mixin) {
  tokenData!: any;
  loading = false;
  colorsDialog = false;
  color = '#8ebc63';
  toast = false;
  errorToast = false;
  @Watch('$vuetify.theme.dark')
  onThemeChange(val) {
    localStorage.setItem('dark_theme', val);
  }
  async toggle() {
    this.loading = true;
    this.$store
      .dispatch('settings/toggle')
      .then(() => {
        this.loading = false;
        this.toast = true;
      })
      .catch(e => {
        this.loading = false;
        this.errorToast = true;
        throw e;
      });
  }
  get supportText() {
    if (typeof this.tokenData.sub === 'string') {
      return 'Lépj be újra és válaszd ki az "Emlékezz rám" opciót!';
    }
    if (!firebase.messaging.isSupported()) {
      return 'A böngésződ nem támogatja a Push értesítéseket!';
    }
    return '';
  }
  get mocks() {
    return [1, 2, 3, 4, 5, null].map(e => ({
      numberValue: e,
      subject: getEvalValue(e),
      date: new Date()
    }));
  }
  updateColor(nv) {
    this.$store.commit('settings/updateColor', {
      key: nv || 'default',
      value: this.color
    });
  }
}
</script>
