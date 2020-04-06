import Mixin from '@/mixins';
declare const Layout_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
export default class Layout extends Layout_base {
    drawer: boolean;
    routes: ({
        path: string;
        component: typeof import("../views/Absences.vue").default;
        text: string;
        icon: string;
        meta: {
            auth: boolean;
        };
        name?: undefined;
    } | {
        path: string;
        component: typeof import("../views/Notes.vue").default;
        text: string;
        icon: string;
        meta: {
            auth: boolean;
        };
        name?: undefined;
    } | {
        path: string;
        component: typeof import("../views/Timetable.vue").default;
        text: string;
        icon: string;
        meta: {
            auth: boolean;
        };
        name?: undefined;
    } | {
        path: string;
        component: typeof import("../views/Evaluations.vue").default;
        text: string;
        icon: string;
        meta: {
            auth: boolean;
        };
        name?: undefined;
    } | {
        path: string;
        component: typeof import("../views/Statistics.vue").default;
        text: string;
        icon: string;
        meta: {
            auth: boolean;
        };
        name?: undefined;
    } | {
        path: string;
        component: typeof import("../views/Login.vue").default;
        meta: {
            auth: boolean;
        };
        text?: undefined;
        icon?: undefined;
        name?: undefined;
    } | {
        path: string;
        name: string;
        icon: string;
        component: typeof import("../views/Profile.vue").default;
        meta: {
            auth: boolean;
        };
        text?: undefined;
    })[];
}
export {};
