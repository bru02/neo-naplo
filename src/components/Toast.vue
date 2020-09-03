<template>
  <v-snackbar
    :timeout="5000"
    :color="toast.color"
    bottom
    :multi-line="(toast.msg || '').length > 50"
    :vertical="mobile && (toast.msg || '').length > 50"
    v-model="active"
    v-touch="{ left: close, right: close, down: close }"
    @click="close"
    @after-leave="next"
  >
    <v-icon dark left v-if="!!toast.icon" class="vts__icon">
      {{ toast.icon }}
    </v-icon>

    <div
      :class="{
        'vts__message--padded': !toast.closeText,
        vts__message: true
      }"
    >
      <div v-html="toast.msg"></div>
    </div>
    <slot></slot>
    <v-btn
      :icon="!toast.closeText"
      :text="!!toast.closeText"
      :class="{ 'vts__close--icon': !toast.closeText, vts__close: true }"
      @click="close"
    >
      <v-icon v-if="!toast.closeText">mdi-close</v-icon>
      <span v-else>{{ toast.closeText }}</span>
    </v-btn>
  </v-snackbar>
</template>

<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { ToastOptions } from '../store/modules/toasts';
import VTouch from 'vuetify/lib/directives/touch';

@Component({
  directives: { touch: VTouch }
})
export default class Toast extends mixins(Mixin) {
  active = false;
  toast: ToastOptions | any = {};
  pendingToast: ToastOptions | any = null;

  mounted() {
    this.$store.watch(
      (_state, getters) => {
        return getters['toasts/currentToast'];
      },
      (currentToast, previous) => {
        if (this.toast && this.active) {
          this.active = false;
        } else this.next();
        this.pendingToast = currentToast;
      }
    );
  }
  next() {
    const { pendingToast } = this;
    this.toast = pendingToast || {};
    if (pendingToast) {
      this.active = true;
      if (pendingToast.slot) {
        this.$slots.default = pendingToast.slot;
      } else {
        delete this.$slots.default;
      }
    }
  }
  @Watch('active')
  onStatusChange(isActive, wasActive) {
    if (!isActive)
      this.$nextTick(() => {
        this.$store.commit('toasts/deleteToast', this.toast?.id);
      });
  }

  close() {
    this.active = false;
    this.toast?.onClose && this.toast?.onClose();
  }
}
</script>

<style>
.vts {
  max-width: none !important;
  width: auto !important;
}
.vts .v-snack__content {
  justify-content: flex-start;
}
.vts__icon {
  margin-right: 12px;
}
.vts__message {
  margin-right: auto;
}
.vts__close {
  margin: 0 -8px 0 24px !important;
  justify-self: flex-end;
}
.vts.v-snack--vertical .vts__icon {
  margin: 0 0 12px !important;
}
.vts.v-snack--vertical .v-snack__content {
  padding-bottom: 16px !important;
}
.vts.v-snack--vertical .vts__message--padded {
  padding: 12px 0 0;
}
.vts.v-snack--vertical .vts__icon + .vts__message {
  padding-top: 0;
}
.vts.v-snack--vertical .vts__close {
  margin: 12px 0 -8px !important;
}
.vts.v-snack--vertical .vts__close--icon {
  margin: 0 !important;
  position: absolute;
  right: 4px;
  top: 4px;
  transform: scale(0.75);
  padding: 4px !important;
}
</style>
