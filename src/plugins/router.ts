import Vue from 'vue';
import VueMeta from 'vue-meta';

import Login from '@/views/Login.vue';
import Home from '@/views/Home.vue';
import Timetable from '@/views/Timetable.vue';
import NotFound from '@/views/NotFound.vue';

const Notes = () =>
  import(
    /* webpackChunkName: "views" */ /* webpackPrefetch: true */ '@/views/Notes.vue'
  );
const Absences = () =>
  import(/* webpackChunkName: "views" */ '@/views/Absences.vue');
const Profile = () =>
  import(/* webpackChunkName: "views" */ '@/views/Profile.vue');
const Statistics = () =>
  import(/* webpackChunkName: "views" */ '@/views/Statistics.vue');
const Evaluations = () =>
  import(/* webpackChunkName: "views" */ '@/views/Evaluations.vue');
const Settings = () =>
  import(/* webpackChunkName: "views" */ '@/views/Settings.vue');
const Exams = () => import(/* webpackChunkName: "views" */ '@/views/Exams.vue');

const routes = [
  {
    name: 'Belépés',
    path: '/login',
    component: Login,
    meta: {
      auth: false
    }
  },
  {
    path: '/:type(evaluation|note|absence|event)/:id?',
    component: Home,
    name: 'Faliújság',

    meta: {
      auth: true
    }
  },
  {
    path: '/',
    component: Home,
    name: 'Faliújság',
    icon: 'mdi-home',
    meta: {
      auth: true
    }
  },
  {
    path: '/absences/:id?',
    component: Absences,
    name: 'Hiányzások',
    icon: 'mdi-block-helper',
    meta: {
      auth: true
    }
  },
  {
    path: '/notes/:id?',
    component: Notes,
    name: 'Feljegyzések',
    icon: 'mdi-comment-processing-outline',
    meta: {
      auth: true
    }
  },
  {
    path: '/timetable/:cweek/:lessonHash?' /*:w?*/,
    component: Timetable,
    name: 'Órarend',
    icon: 'mdi-calendar-text-outline',
    meta: {
      auth: true
    },
    props: true
  },
  {
    path: '/timetable',
    redirect: '/timetable/0'
  },
  {
    path: '/evaluations/:id?',
    component: Evaluations,
    name: 'Jegyek',
    icon: 'mdi-calendar-check-outline',
    meta: {
      auth: true
    }
  },
  {
    path: '/statistics/:subject?/:type?/:id?',
    component: Statistics,
    name: 'Statisztikák',
    icon: 'mdi-chart-timeline-variant',
    meta: {
      auth: true
    },
    props: true
  },
  {
    path: '/exams',
    name: 'Számonkérések',
    icon: 'mdi-file-document-edit-outline',
    component: Exams,
    meta: {
      auth: true
    }
  },
  {
    path: '/profile',
    name: 'Profil',
    icon: 'mdi-account',
    component: Profile,
    meta: {
      auth: true
    }
  },
  {
    path: '/settings/:dialog?',
    name: 'Beállítások',
    icon: 'mdi-settings',
    component: Settings,
    meta: {
      auth: true
    }
  },

  {
    path: '*',
    component: NotFound
  }
];

import VueRouter from 'vue-router';

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
  }
});

(Vue as any).router = router;

export default router;
export { routes };
