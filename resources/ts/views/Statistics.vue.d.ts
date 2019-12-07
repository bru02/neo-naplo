import { Evaluation } from '@/api-types';
import Mixin from '@/mixins';
declare const Statistics_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
export default class Statistics extends Statistics_base {
    evaluations: Evaluation[];
    selectedSubject: boolean;
    readonly values: {
        value: (number | import("../api-types").Value)[];
        labels: string[];
    };
}
export {};
