import { Getters, Mutations, Actions, Module } from 'vuex-smart-module';

class TimeState {
  now = new Date();
  timeoutId: undefined | number = undefined;
  requestId: number = 0;
}

class TimeGetters extends Getters<TimeState> {
  get time() {
    return new Date(this.state.now);
  }

  get date() {
    return new Date(this.getters.time).setHours(0, 0, 0, 0);
  }
}

class TimeMutations extends Mutations<TimeState> {
  updateTime() {
    this.state.now = new Date();
  }
}

class TimeActions extends Actions<
  TimeState,
  TimeGetters,
  TimeMutations,
  TimeActions
> {
  $init() {
    document.addEventListener('visibilitychange', () => {
      switch (document.visibilityState) {
        case 'visible':
          this.progress();
          break;

        case 'hidden':
          this.pause();
          break;

        default:
      }
    });

    if (document.visibilityState === 'visible') {
      this.continue();
    }
  }
  continue() {
    if (window.requestAnimationFrame) {
      let start;
      const step = (timestamp) => {
        if (!start) {
          start = timestamp;
        }

        if (timestamp - start < 60000) {
          this.state.requestId = requestAnimationFrame(step);
        } else {
          this.progress();
        }
      };

      this.state.requestId = requestAnimationFrame(step);
    } else {
      this.state.timeoutId = setTimeout(() => {
        this.progress();
      }, 60000);
    }
  }

  pause() {
    if (window.requestAnimationFrame) {
      cancelAnimationFrame(this.state.requestId);
    } else {
      clearTimeout(this.state.timeoutId);
    }
  }

  progress() {
    this.mutations.updateTime();
    this.continue();
  }
}

export default new Module({
  state: TimeState,
  getters: TimeGetters,
  mutations: TimeMutations,
  actions: TimeActions,
});
