import Notes from '@/views/Notes.vue';
import Absences from '@/views/Absences.vue';
import Timetable from '@/views/Timetable.vue';
import Evaluations from '@/views/Evaluations.vue';
import Statistics from '@/views/Statistics.vue';
import Profile from '@/views/Profile.vue';
import Login from '@/views/Login.vue';
declare const routes: ({
    path: string;
    component: typeof Absences;
    text: string;
    icon: string;
    meta: {
        auth: boolean;
    };
    name?: undefined;
} | {
    path: string;
    component: typeof Notes;
    text: string;
    icon: string;
    meta: {
        auth: boolean;
    };
    name?: undefined;
} | {
    path: string;
    component: typeof Timetable;
    text: string;
    icon: string;
    meta: {
        auth: boolean;
    };
    name?: undefined;
} | {
    path: string;
    component: typeof Evaluations;
    text: string;
    icon: string;
    meta: {
        auth: boolean;
    };
    name?: undefined;
} | {
    path: string;
    component: typeof Statistics;
    text: string;
    icon: string;
    meta: {
        auth: boolean;
    };
    name?: undefined;
} | {
    path: string;
    component: typeof Login;
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
    component: typeof Profile;
    meta: {
        auth: boolean;
    };
    text?: undefined;
})[];
import VueRouter from 'vue-router';
declare const router: VueRouter;
export default router;
export { routes };
