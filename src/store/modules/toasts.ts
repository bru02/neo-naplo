import { Getters, Mutations, Actions, Module } from 'vuex-smart-module';
import { VNode } from 'vue/types/umd';

export interface ToastOptions {
  id?: number;
  msg?: string;
  queueable?: boolean;
  closeText?: string;
  color?: string;
  icon?: string;
  slot?: VNode[];
  onClose?: Function;
}

let nextId = 1;

class ToastsState {
  queue: ToastOptions[] = [];
}

class ToastsGetters extends Getters<ToastsState> {
  get currentToast() {
    return this.state.queue[0] ?? false;
  }
}

class ToastsMutations extends Mutations<ToastsState> {
  addToast({ toast, front }: { toast: ToastOptions; front?: boolean }) {
    this.state.queue[front || false ? 'unshift' : 'push']({
      ...toast,
      id: nextId++,
    });
  }
  deleteToast(id: number) {
    this.state.queue = this.state.queue.filter((t) => t.id !== id);
  }
}

class ToastsActions extends Actions<
  ToastsState,
  ToastsGetters,
  ToastsMutations,
  ToastsActions
> {
  show(toast: ToastOptions | any = {}) {
    const isQueueable = toast.queueable ?? true;
    if (isQueueable) {
      this.mutations.addToast({ toast });
    } else {
      this.mutations.addToast({ toast, front: true });
    }
  }
}

export default new Module({
  state: ToastsState,
  getters: ToastsGetters,
  mutations: ToastsMutations,
  actions: ToastsActions,
});
