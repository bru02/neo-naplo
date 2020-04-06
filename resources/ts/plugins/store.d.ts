import { Getters, Mutations, Actions, Module } from 'vuex-smart-module';
import { GeneralAPI } from '../api-types';
declare class ApiState {
    general: {
        loading: boolean;
        data: GeneralAPI | any;
    };
    homework: never[];
    timetable: {};
}
declare class ApiGetters extends Getters<ApiState> {
    readonly cards: any[];
}
declare class ApiMutations extends Mutations<ApiState> {
    updateGeneral(data: GeneralAPI): void;
    updateHomeworks(data: any): void;
    updateTimetable(data: any): void;
}
declare class ApiActions extends Actions<ApiState, ApiGetters, ApiMutations, ApiActions> {
    pullGeneral(): void;
    pullHomeworks(): void;
    pullTimetable({ from, to }: {
        from: any;
        to: any;
    }): void;
}
declare const module: Module<ApiState, ApiGetters, ApiMutations, ApiActions>, store: import("vuex").Store<any>;
export default module;
export { store };
