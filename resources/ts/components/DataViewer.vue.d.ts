import Mixin from '@/mixins';
declare const DataViewer_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
export default class DataViewer extends DataViewer_base {
    readonly fn: Function;
    readonly title: String | undefined;
    readonly value: Object | Boolean;
    open: boolean;
    values: {};
    onVC(val: any): void;
    onOC(val: any): void;
}
export {};
