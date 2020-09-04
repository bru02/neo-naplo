<template>
  <Dialog v-model="open" title="Új számonkérés"> </Dialog>
</template>

<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import Dialog from './Dialog.vue';
import { Watch, Prop } from 'vue-property-decorator';
@Component({
  components: { Dialog },
})
export default class DataViewer extends mixins(Mixin) {
  @Prop([Object, Boolean]) readonly value!: Boolean;

  open = false;

  @Watch('value')
  onVC(val) {
    this.open = !!val;
  }
  @Watch('open')
  onOC(val) {
    if (!val) {
      this.$emit('input', false);
    }
  }
}
</script>
