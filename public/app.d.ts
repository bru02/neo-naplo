declare module "filters/date" {
    const _default: (value: number) => string;
    export default _default;
}
declare module "filters/toldyLink" {
    const _default_1: (value: string) => string;
    export default _default_1;
}
declare module "store" {
    import { Getters, Mutations, Actions, Module } from 'vuex-smart-module';
    class ApiState {
        loading: boolean;
        general: {
            absences: never[];
            evaluations: never[];
            notes: never[];
            events: never[];
        };
        homework: never[];
        timetable: {};
    }
    class ApiGetters extends Getters<ApiState> {
        readonly cards: any[];
    }
    class ApiMutations extends Mutations<ApiState> {
        updateGeneral(data: any): void;
        updateHomeworks(data: any): void;
        updateTimetable(data: any): void;
        loading(): void;
        doneLoading(): void;
    }
    class ApiActions extends Actions<ApiState, ApiGetters, ApiMutations, ApiActions> {
        pullGeneral(): void;
        pullHomeworks(): void;
        pullTimetable(): void;
    }
    const _default_2: Module<ApiState, ApiGetters, ApiMutations, ApiActions>;
    export default _default_2;
}
declare module "components/NotesComponent.vue" {
    import Mixin from "mixins";
    const NotesComponent_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
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
        pagination: {
            sortBy: string;
            descending: boolean;
            rowsPerPage: number;
        };
    }
    import Vue, { VueConstructor } from 'vue';
    export { Vue, VueConstructor };
}
declare module "components/AbsencesList.vue" {
    import Api from "mixins";
    const AbsencesList_base: import("vue-class-component/lib/declarations").VueClass<Api>;
    export default class AbsencesList extends AbsencesList_base {
        readonly absences: any[] | undefined;
    }
    import Vue, { VueConstructor } from 'vue';
    export { Vue, VueConstructor };
}
declare module "components/Dialog.vue" {
    import Api from "mixins";
    const Dialog_base: import("vue-class-component/lib/declarations").VueClass<Api>;
    export default class Dialog extends Dialog_base {
        readonly title: String | undefined;
        readonly value: Object | Boolean;
        dialog: boolean;
        onVC(val: any): void;
        onDC(val: any): void;
    }
    import Vue, { VueConstructor } from 'vue';
    export { Vue, VueConstructor };
}
declare module "components/AbsencesComponent.vue" {
    import Mixin from "mixins";
    const AbsencesComponent_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
    export default class AbsencesComponent extends AbsencesComponent_base {
        selectedAbsence: boolean;
    }
    import Vue, { VueConstructor } from 'vue';
    export { Vue, VueConstructor };
}
declare module "components/DataViewer.vue" {
    import Api from "mixins";
    const DataViewer_base: import("vue-class-component/lib/declarations").VueClass<Api>;
    export default class DataViewer extends DataViewer_base {
        readonly fn: Function;
        readonly title: String | undefined;
        readonly value: Object | Boolean;
        open: boolean;
        values: {};
        onVC(val: any): void;
        onOC(val: any): void;
    }
    import Vue, { VueConstructor } from 'vue';
    export { Vue, VueConstructor };
}
declare module "components/HomeComponent.vue" {
    import Mixin from "mixins";
    const HomeComponent_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
    export default class HomeComponent extends HomeComponent_base {
        selectedNote: boolean;
        selectedAbsence: boolean;
        selectedEval: boolean;
        selectedLesson: boolean;
        absencesDialog: boolean;
        selectedAbsenceGroup: boolean;
        onVC(val: any): void;
        onADC(val: any): void;
    }
    import Vue, { VueConstructor } from 'vue';
    export { Vue, VueConstructor };
}
declare module "router" {
    let routes: any;
    import VueRouter from 'vue-router';
    const _default_3: VueRouter;
    export default _default_3;
    export { routes };
}
declare module "mixins" {
    import Vue from 'vue';
    import formatDate from "filters/date";
    import toldyLink from "filters/toldyLink";
    export default class Mixin extends Vue {
        group(arr: any, key: string): {};
        getAbsenceColor(justificationState: string): any;
        getKey(item: any): string;
        noteValues({ content, type, title, date, teacher, creatingTime }: {
            content: any;
            type: any;
            title: any;
            date: any;
            teacher: any;
            creatingTime: any;
        }): {
            'Tartalom': any;
            'Típus': any;
            'Cím': any;
            'Dátum': string;
            'Tanár': string;
            'Naplózás dátuma': string;
        };
        evalValues({ value, weight, theme, subject, mode, typeName, date, teacher, creatingTime }: {
            value: any;
            weight: any;
            theme: any;
            subject: any;
            mode: any;
            typeName: any;
            date: any;
            teacher: any;
            creatingTime: any;
        }): {
            'Jegy': string;
            'Téma': any;
            'Tantárgy': any;
            'Mód': any;
            'Típus': any;
            'Dátum': string;
            'Tanár': string;
            'Naplózás dátuma': string;
        };
        lessonValues(abs: any): {
            'Típus': any;
            'Tantárgy': any;
            'Dátum': string;
            'Igazolás típusa': any;
            'Tanár': string;
            'Naplózás dátuma': string;
        };
        absenceValues({ typeName, subject, lessonStartTime, justificationTypeName, teacher, creatingTime }: {
            typeName: any;
            subject: any;
            lessonStartTime: any;
            justificationTypeName: any;
            teacher: any;
            creatingTime: any;
        }): {
            'Típus': any;
            'Tantárgy': any;
            'Dátum': string;
            'Igazolás típusa': any;
            'Tanár': string;
            'Naplózás dátuma': string;
        };
        toldyLink: (value: string) => string;
        formatDate: (value: number) => string;
        mobile: boolean;
        routes: any;
    }
    export { formatDate, toldyLink };
}
declare module "components/LoginComponent.vue" {
    import Mixin from "mixins";
    const LoginComponent_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
    export default class LoginComponent extends LoginComponent_base {
        readonly: string | undefined;
        $refs: {
            form: HTMLFormElement;
        };
        props: string[];
        valid: boolean;
        e1: boolean;
        password: string;
        passwordRules: ((v: any) => true | "Jelszó megadása kötelező")[];
        username: string;
        unRules: ((v: any) => true | "Felhasználónév megadása kötelező")[];
        school: string;
        schoolRules: ((v: any) => true | "Iskola megadása kötelező")[];
        schools: never[];
        loading: boolean;
        created(): void;
        submit(): void;
        clear(): void;
    }
    import Vue, { VueConstructor } from 'vue';
    export { Vue, VueConstructor };
}
declare module "components/Layout.vue" {
    import Mixin from "mixins";
    const Layout_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
    export default class Layout extends Layout_base {
        drawer: null;
        drawerRight: boolean;
        toogleRightDrawer(): void;
    }
    import Vue, { VueConstructor } from 'vue';
    export { Vue, VueConstructor };
}
declare module "app" {
    import 'vuetify/src/stylus/app.styl';
    import Mixin from "mixins";
    const App_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
    export default class App extends App_base {
        el: string;
        store: import("vuex").Store<any>;
        router: import("vue-router").default;
        mounted(): void;
    }
}
