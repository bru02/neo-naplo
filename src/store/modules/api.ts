import {
  TimetableAPI,
  Evaluation,
  ClassAverage,
  Exam
} from './../../api-types.d';
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
  exams = new Resource<Exam[]>([]);
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
    cards.push(
      ...this.state.exams.data.map(e => {
        (e as any).category = 'exams';
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

  get flatAbsences() {
    return this.state.general.data.absences.map(a => a.items).flatMap(a => a);
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
  updateExams(data: Exam[]) {
    this.state.exams.update(data);
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
    this.state.exams.reset();
    localStorage.setItem('packData', '');
  }
}

class ApiActions extends Actions<
  ApiState,
  ApiGetters,
  ApiMutations,
  ApiActions
> {
  async pullGeneral(): Promise<GeneralAPI> {
    this.state.general.load();
    const response = await api.getGeneral();
    if (response) {
      this.commit('updateGeneral', response);
      return response;
    }
    return this.state.general.data;
  }
  async pullEvents(): Promise<Event[]> {
    this.state.events.load();
    const response = await api.getEvents();
    if (response) {
      this.commit('updateEvents', response);
      return response;
    }
    return this.state.events.data;
  }
  async pullHirdetmenyek(className: string): Promise<Event[]> {
    this.state.hirdetmenyek.load();
    const response = await api.getHirdetmenyek(className);
    if (response) {
      this.commit('updateHirdetmenyek', response);
      return response;
    }
    return this.state.hirdetmenyek.data;
  }
  async pullClassAverages(): Promise<ClassAverage[]> {
    this.state.classAverages.load();
    const response = await api.getClassAverages();
    if (response) {
      this.commit('updateClassAverages', response);
      return response;
    }
    return this.state.classAverages.data;
  }
  async pullHomeworks() {
    this.state.homework.load();
    const response = await api.getHomeworks();
    this.commit('updateHomeworks', response);
    return response;
  }
  async pullExams() {
    this.state.exams.load();
    const response = await api.getExams();
    this.commit('updateExams', response);
    return response;
  }
  async pullTimetable({ from, to }): Promise<TimetableAPI> {
    let range = `${from}-${to}`;
    if (!(range in this.state.timetable)) {
      Vue.set(this.state.timetable, range, {
        data: {},
        loading: true,
        loaded: false
      });
    } else this.state.timetable[range].loading = true;
    const response = await api.getTimetable(from, to);
    if (response) {
      this.commit('updateTimetable', { response, range });
      return response;
    }
    return {};
  }
}

function _sortValue(item) {
  return 'creatingTime' in item
    ? item.creatingTime
    : item.date;
}

export default new Module({
  state: ApiState,
  getters: ApiGetters,
  mutations: ApiMutations,
  actions: ApiActions
});
