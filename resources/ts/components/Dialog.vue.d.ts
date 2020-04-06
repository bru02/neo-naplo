import Mixin from '@/mixins';
declare const Dialog_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
export default class Dialog extends Dialog_base {
    readonly title: String | undefined;
    readonly value: Object | Boolean;
    dialog: boolean;
    onVC(val: any): void;
    onDC(val: any): void;
}
export {};
