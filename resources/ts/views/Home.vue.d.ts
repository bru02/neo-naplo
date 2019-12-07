import Mixin from '@/mixins';
declare const HomeComponent_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
export default class HomeComponent extends HomeComponent_base {
    selectedNote: boolean;
    selectedAbsence: boolean;
    selectedEval: boolean;
    selectedLesson: boolean;
    selectedEvent: boolean;
    absencesDialog: boolean;
    selectedAbsenceGroup: boolean;
    onVC(val: any): void;
    onADC(val: any): void;
}
export {};
