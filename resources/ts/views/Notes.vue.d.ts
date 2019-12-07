import Mixin from '@/mixins';
declare const NotesComponent_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
export default class NotesComponent extends NotesComponent_base {
    headers: ({
        text: string;
        align: string;
        value: string;
    } | {
        text: string;
        value: string;
        align?: undefined;
    })[];
}
export {};
