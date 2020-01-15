import { TimetableAPI, Evaluation, ClassAverage } from './../../api-types.d';
import Vue from 'vue';
import Vuex from 'vuex';
import { Getters, Mutations, Actions, Module } from 'vuex-smart-module';
import { GeneralAPI } from '@/api-types';
import api from '@/api';
import group from '@/utils';
Vue.use(Vuex);

declare type resource<T> = {
  data: T | any;
  loading: boolean;
};

export class ApiState {
  general: resource<GeneralAPI> = {
    loading: false,
    data: {
      absences: [],
      events: [],
      evaluations: [],
      notes: [],
      classAverages: []
    }
  };
  homework = [];
  timetable: { [key: string]: resource<TimetableAPI> } = {};
}

class ApiGetters extends Getters<ApiState> {
  get cards() {
    let cards: any[] = [];
    for (let type of ['absences', 'notes', 'evaluations', 'events']) {
      cards.push(
        ...this.state.general.data[type].map(e => {
          e.category = type;
          return e;
        })
      );
    }
    return cards.sort((a, b) => {
      return _sortValue(b) - _sortValue(a);
    });
  }
  get absences() {
    return this.state.general.data.absences;
  }

  get evaluations() {
    return this.state.general.data.evaluations;
  }

  get classAverages() {
    return this.state.general.data.classAverages;
  }

  get groupedEvaluations(): { [k: string]: Evaluation[] } {
    return group(this.getters.evaluations, 'subject');
  }

  get groupedClassAverages(): { [k: string]: ClassAverage[] } {
    return group(this.getters.classAverages, 'subject');
  }
}

class ApiMutations extends Mutations<ApiState> {
  updateGeneral(data: GeneralAPI) {
    this.state.general.data = data;
    this.state.general.loading = false;
  }
  updateHomeworks(data) {
    this.state.homework = data;
  }
  updateTimetable(data: { range: string; response: TimetableAPI }) {
    Vue.set(this.state.timetable[data.range], 'data', data.response);
    this.state.timetable[data.range].loading = false;
  }
  reset() {
    this.state.timetable = {};
    this.state.general.data = {
      absences: [],
      events: [],
      evaluations: [],
      notes: [],
      classAverages: []
    };
    this.state.homework = [];
  }
}

class ApiActions extends Actions<
  ApiState,
  ApiGetters,
  ApiMutations,
  ApiActions
> {
  pullGeneral(): Promise<GeneralAPI> {
    this.state.general.loading = true;
    return api.getGeneral().then(response => {
      this.commit('updateGeneral', response);
      return response;
    });
  }
  pullHomeworks() {
    return api.getHomeworks().then(response => {
      this.commit('updateHomeworks', response);
      return response;
    });
  }
  pullTimetable({ from, to }): Promise<TimetableAPI> {
    let range = `${from}-${to}`;
    if (!(range in this.state.timetable)) {
      Vue.set(this.state.timetable, range, { data: {}, loading: true });
    } else this.state.timetable[range].loading = true;
    return api.getTimetable(from, to).then(response => {
      this.commit('updateTimetable', { response, range });
      return response;
    });
  }
}

function _sortValue(item) {
  return 'creatingTime' in item ? item.creatingTime : item.date;
}

export default new Module({
  state: ApiState,
  getters: ApiGetters,
  mutations: ApiMutations,
  actions: ApiActions
});
