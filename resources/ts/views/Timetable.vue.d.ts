import Mixin from '@/mixins';
declare const TimetableComponent_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
export default class TimetableComponent extends TimetableComponent_base {
    active: number;
    cweek: number;
    _timetable: any;
    selectedLesson: boolean;
    mounted(): void;
    readonly week: {
        from: string;
        to: string;
    };
    readonly css: {
        flexGrow: number;
        maxWidth: string;
        flexBasis: string;
    };
    readonly timetable: any;
}
export {};
