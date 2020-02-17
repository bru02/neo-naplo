import { TimetableAPI, Evaluation, ClassAverage } from './../../api-types.d';
import Vue from 'vue';
import Vuex from 'vuex';
import { Getters, Mutations, Actions, Module } from 'vuex-smart-module';
import { GeneralAPI } from '@/api-types';
import api from '@/api';
import group from '@/utils';
Vue.use(Vuex);

class Resource<T> {
  data: T;
  default: any;
  loading = false;
  loaded = false;
  constructor(data) {
    this.data = data;
    this.default = data;
  }
  update(data: T) {
    this.loaded = true;
    this.loading = false;
    Vue.set(this, 'data', data);
  }
  reset() {
    this.data = this.default;
    this.loaded = false;
  }
  load() {
    this.loading = true;
  }
}

export class ApiState {
  general = new Resource<GeneralAPI>({
    absences: [],
    evaluations: [],
    notes: []
  });
  homework = new Resource<any[]>([]);
  events = new Resource<Event[]>([]);
  hirdetmenyek = new Resource<Event[]>([]);
  classAverages = new Resource<ClassAverage[]>([]);
  timetable: { [key: string]: Resource<TimetableAPI> } = {};
}

class ApiGetters extends Getters<ApiState> {
  get cards() {
    let cards: any[] = [];
    for (let type of ['absences', 'notes', 'evaluations']) {
      cards.push(
        ...this.state.general.data[type].map(e => {
          e.category = type;
          return e;
        })
      );
    }
    cards.push(
      ...this.getters.events.map(e => {
        (e as any).category = 'events';
        return e;
      })
    );
    return cards.sort((a, b) => {
      return _sortValue(b) - _sortValue(a);
    });
  }
  get absences() {
    return this.state.general.data.absences;
  }

  get events() {
    return [...this.state.events.data, ...this.state.hirdetmenyek.data];
  }

  get evaluations() {
    return this.state.general.data.evaluations;
  }

  get groupedEvaluations(): { [k: string]: Evaluation[] } {
    return group(this.getters.evaluations, 'subject');
  }

  get groupedClassAverages(): { [k: string]: ClassAverage[] } {
    return group(this.state.classAverages.data, 'subject');
  }
}

class ApiMutations extends Mutations<ApiState> {
  updateGeneral(data: GeneralAPI) {
    this.state.general.update(data);
  }
  updateEvents(data: Event[]) {
    this.state.events.update(data);
  }
  updateHirdetmenyek(data: Event[]) {
    this.state.hirdetmenyek.update(data);
  }
  updateClassAverages(data: ClassAverage[]) {
    this.state.classAverages.update(data);
  }
  updateHomeworks(data) {
    this.state.homework.update(data);
  }
  updateTimetable(data: { range: string; response: TimetableAPI }) {
    Vue.set(this.state.timetable[data.range], 'data', data.response);
    this.state.timetable[data.range].loading = false;
    this.state.timetable[data.range].loaded = true;
  }
  reset() {
    this.state.timetable = {};
    this.state.general.reset();
    this.state.events.reset();
    this.state.hirdetmenyek.reset();
    this.state.classAverages.reset();
    this.state.homework.reset();
  }
}

class ApiActions extends Actions<
  ApiState,
  ApiGetters,
  ApiMutations,
  ApiActions
> {
  pullGeneral(): Promise<GeneralAPI> {
    this.state.general.load();
    return api.getGeneral().then(response => {
      if (response) {
        this.commit('updateGeneral', response);
        return response;
      }
      return this.state.general.data;
    });
  }
  pullEvents(): Promise<Event[]> {
    this.state.events.load();
    return api.getEvents().then(response => {
      if (response) {
        this.commit('updateEvents', response);
        return response;
      }
      return this.state.events.data;
    });
  }
  pullHirdetmenyek(className: string): Promise<GeneralAPI> {
    this.state.hirdetmenyek.load();
    return api.getHirdetmenyek(className).then(response => {
      if (response) {
        this.commit('updateHirdetmenyek', response);
        return response;
      }
      return this.state.hirdetmenyek.data;
    });
  }
  pullClassAverages(): Promise<GeneralAPI> {
    this.state.classAverages.load();
    return api.getClassAverages().then(response => {
      if (response) {
        this.commit('updateClassAverages', response);
        return response;
      }
      return this.state.classAverages.data;
    });
  }
  pullHomeworks() {
    this.state.homework.load();
    return api.getHomeworks().then(response => {
      this.commit('updateHomeworks', response);
      return response;
    });
  }
  pullTimetable({ from, to }): Promise<TimetableAPI> {
    let range = `${from}-${to}`;
    if (!(range in this.state.timetable)) {
      Vue.set(this.state.timetable, range, {
        data: {},
        loading: true,
        loaded: false
      });
    } else this.state.timetable[range].loading = true;
    return api.getTimetable(from, to).then(response => {
      if (response) {
        this.commit('updateTimetable', { response, range });
        return response;
      }
      return {};
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
