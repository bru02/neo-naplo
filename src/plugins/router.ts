import { toast } from './toasts';
import Vue from 'vue';
import VueMeta from 'vue-meta';

import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import Timetable from '@/views/Timetable.vue';
import NotFound from '@/views/NotFound.vue';

const Notes = () => import('@/views/Notes.vue');
const Absences = () => import('@/views/Absences.vue');
const Profile = () => import('@/views/Profile.vue');
const Statistics = () => import('@/views/Statistics.vue');
const Statistic = () => import('@/views/Statistic.vue');
const Evaluations = () => import('@/views/Evaluations.vue');
const Settings = () => import('@/views/Settings.vue');
const Exams = () => import('@/views/Exams.vue');

const NoteDialog = () => import('@/components/dialogs/NoteDialog.vue');
const AbsenceDialog = () => import('@/components/dialogs/AbsenceDialog.vue');
const EvaluationDialog = () =>
  import('@/components/dialogs/EvaluationDialog.vue');
const EventDialog = () => import('@/components/dialogs/EventDialog.vue');

const routes: RouteConfig[] = [
  {
    name: 'Belépés',
    path: '/login',
    component: Login,
    meta: {
      auth: false,
    },
  },
  {
    path: '/',
    component: Home,
    name: 'Faliújság',
    meta: {
      auth: true,
    },
    children: [
      {
        path: '/note/:id',
        component: NoteDialog,
        props: true,
        beforeEnter: async (to, _, next) => {
          await obtain('general');
          const note = store.state.api.general.data?.notes.find(
            ({ id }) => +to.params.id === id
          );
          if (!note) {
            toast.error('Nem található a feljegyzés!');
            next(false);
            return;
          }
          to.params.note = note;
          next();
        },
      },
      {
        path: '/absence/:id',
        component: AbsenceDialog,
        props: true,
        beforeEnter: async (to, _, next) => {
          await obtain('general');
          const abs = store.state.api.general.data?.absences.find(
            ({ id }) => +to.params.id === id
          );
          if (!abs) {
            toast.error('Nem található a mulasztás!');
            next(false);
            return;
          }
          to.params.abs = abs;
          next();
        },
      },
      {
        path: '/event/:id',
        component: EventDialog,
        props: true,
        beforeEnter: async (to, _, next) => {
          await obtain('general');
          const evt = store.state.api.general.data?.events.find(
            ({ id }) => +to.params.id === id
          );
          if (!evt) {
            toast.error('Nem található a hirdetmény!');
            next(false);
            return;
          }
          to.params.event = evt;
          next();
        },
      },
      {
        path: '/evaluation/:id',
        component: EvaluationDialog,
        props: true,
        beforeEnter: async (to, _, next) => {
          await obtain('general');
          const evaluation = store.state.api.general.data?.evaluations.find(
            ({ id }) => +to.params.id === id
          );
          if (!evaluation) {
            toast.error('Nem található az értékelés!');
            next(false);
            return;
          }
          to.params.eval = evaluation;
          next();
        },
      },
    ],
  },
  {
    path: '/absences',
    component: Absences,
    name: 'Hiányzások',
    meta: {
      auth: true,
    },
    children: [
      {
        path: '/absences/:id',
        component: AbsenceDialog,
        props: true,
        beforeEnter: async (to, _, next) => {
          await obtain('general');
          const abs = store.state.api.general.data?.absences.find(
            ({ id }) => +to.params.id === id
          );
          if (!abs) {
            toast.error('Nem található a mulasztás!');
            next(false);
            return;
          }
          to.params.abs = abs;
          next();
        },
      },
    ],
  },
  {
    path: '/notes',
    component: Notes,
    name: 'Feljegyzések',
    meta: {
      auth: true,
    },
    children: [
      {
        path: '/notes/:id',
        component: NoteDialog,
        props: true,
        beforeEnter: async (to, _, next) => {
          await obtain('general');
          const note = store.state.api.general.data?.notes.find(
            ({ id }) => +to.params.id === id
          );
          if (!note) {
            toast.error('Nem található a feljegyzés!');
            next(false);
            return;
          }
          to.params.note = note;
          next();
        },
      },
    ],
  },
  {
    path: '/timetable/:cweek/:lessonHash?' /*:w?*/,
    component: Timetable,
    name: 'Órarend',
    meta: {
      auth: true,
    },
    props: true,
  },
  {
    path: '/timetable',
    redirect: '/timetable/0',
  },
  {
    path: '/evaluations',
    component: Evaluations,
    name: 'Jegyek',
    meta: {
      auth: true,
    },
    children: [
      {
        path: '/evaluations/:id',
        component: EvaluationDialog,
        props: true,
        beforeEnter: async (to, _, next) => {
          await obtain('general');
          const evaluation = store.state.api.general.data?.evaluations.find(
            ({ id }) => +to.params.id === id
          );
          if (!evaluation) {
            toast.error('Nem található az értékelés!');
            next(false);
            return;
          }
          to.params.eval = evaluation;
          next();
        },
      },
    ],
  },
  {
    path: '/statistics',
    component: Statistics,
    name: 'Statisztikák',
    meta: {
      auth: true,
    },
    props: true,
  },
  {
    path: '/statistics/:subject/:type?/:id?',
    component: Statistic,
    name: 'Statisztika',
    meta: {
      auth: true,
    },
    props: true,
  },
  {
    path: '/exams',
    name: 'Számonkérések',
    component: Exams,
    meta: {
      auth: true,
    },
  },
  {
    path: '/profile',
    name: 'Profil',
    component: Profile,
    meta: {
      auth: true,
    },
  },
  {
    path: '/settings',
    name: 'Beállítások',
    component: Settings,
    meta: {
      auth: true,
    },
  },

  {
    path: '*',
    component: NotFound,
  },
];

import VueRouter, { RouteConfig } from 'vue-router';
import store from '@/store';
import { obtain } from '@/helpers';

Vue.use(VueRouter);
Vue.use(VueMeta);

const router = new VueRouter({
  routes,
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.name != from.name) {
      return { x: 0, y: 0 };
    }
  },
});

export default router;
