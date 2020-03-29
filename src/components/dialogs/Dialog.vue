<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="mobile"
    :width="mobile ? null : 500"
    :transition="`${mobile ? 'slide-x-reverse' : 'dialog'}-transition`"
  >
    <v-card
      v-touch="{
        right: () => (dialog = false)
      }"
    >
      <v-toolbar dark color="indigo darken-2" dense v-show="mobile">
        <v-btn icon dark @click="dialog = false">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <slot name="toolbar"></slot>
      </v-toolbar>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="dialog = false">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Watch, Prop } from 'vue-property-decorator';
import VTouch from 'vuetify/lib/directives/touch';

@Component({
  directives: { touch: VTouch }
})
export default class Dialog extends mixins(Mixin) {
  @Prop(String) readonly title!: String | undefined;
  @Prop() readonly value!: any;

  dialog = false;

  @Watch('value')
  onVC(val) {
    this.dialog = !!val;
  }
  @Watch('dialog')
  onDC(val) {
    if (!val) {
      this.$emit('input', false);
    }
  }
}
</script>
