<template>
  <Dialog :value="open" @input="onInput" title="Hirdetmény">
    <v-list>
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ event.title }}</v-list-item-title>
          <v-list-item-subtitle>Cím</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title v-html="formatText(event.content)" />
          <v-list-item-subtitle>Tartalom</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >

      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{ event.date | formatDate }}</v-list-item-title>
          <v-list-item-subtitle>Dátum</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        ><v-list-item-content>
          <v-list-item-title>{{
            event.endDate | formatDate
          }}</v-list-item-title>
          <v-list-item-subtitle>Utoljára látható</v-list-item-subtitle>
        </v-list-item-content></v-list-item
      >
      <v-list-item
        v-for="(attachment, i) in event.attachments || []"
        :key="i"
        :to="attachment.url"
      >
        <v-list-item-content>
          <v-list-item-title>{{ attachment.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </Dialog>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import Dialog from './Dialog.vue';
import { Prop } from 'vue-property-decorator';
import { Event } from '../../api-types';
@Component({
  components: { Dialog },
})
export default class EventDialog extends mixins(Mixin) {
  open = false;
  @Prop(Object) readonly event!: Event;
  mounted() {
    this.open = true;
  }
  beforeRouteLeave(_, __, next) {
    if (!this.open) {
      next();
      return;
    }
    this.open = false;
    this.$nextTick(() => {
      next();
    });
  }
  onInput(val) {
    if (val === false) {
      this.$nextTick(() => {
        this.$router.go(-1);
      });
    }
  }
}
</script>
