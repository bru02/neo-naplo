<template>
  <Dialog v-model="open" :title="title">
    <v-list two-line>
      <v-list-item
        v-for="(val, key) in values"
        :key="key"
        :ripple="!!(val && val.to)"
        :inactive="val ? !val.to : true"
        :to="val && val.to"
      >
        <v-list-item-content>
          <v-list-item-title
            v-html="val ? (val.title ? val.title : val) : '-'"
          ></v-list-item-title>
          <v-list-item-subtitle v-html="key"></v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </Dialog>
</template>

<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import Dialog from './Dialog.vue';
import { Watch, Prop } from 'vue-property-decorator';
@Component({
  components: { Dialog }
})
export default class DataViewer extends mixins(Mixin) {
  @Prop(Function) readonly fn!: Function;
  @Prop(String) readonly title!: String | undefined;
  @Prop([Object, Boolean]) readonly value!: Object | Boolean;

  open = false;
  values = {};
  @Watch('value')
  onVC(val) {
    if (val !== false) {
      this.values = this.fn(val);
    }
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
