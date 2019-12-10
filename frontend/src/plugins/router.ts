import Vue from 'vue';
import VueMeta from 'vue-meta';

import Notes from '@/views/Notes.vue';
import Absences from '@/views/Absences.vue';
import Home from '@/views/Home.vue';
import Timetable from '@/views/Timetable.vue';
import Evaluations from '@/views/Evaluations.vue';
import Statistics from '@/views/Statistics.vue';
import Profile from '@/views/Profile.vue';
import Login from '@/views/Login.vue';

const routes = [
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
    path: '/absences',
    component: Absences,
    name: 'Hiányzások',
    icon: 'mdi-block-helper',
    meta: {
      auth: true
    }
  },
  {
    path: '/notes',
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
    path: '/evaluations',
    component: Evaluations,
    name: 'Jegyek',
    icon: 'mdi-calendar-check-outline',
    meta: {
      auth: true
    }
  },
  {
    path: '/statistics/:subject?',
    component: Statistics,
    name: 'Statisztikák',
    icon: 'mdi-calendar-check-outline',
    meta: {
      auth: true
    },
    props: true
  },
  {
    path: '/login',
    component: Login,
    meta: {
      auth: false
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
  }
];

import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(VueMeta);

const router = new VueRouter({
  routes,
  mode: 'history',
  base: process.env.BASE_URL
});

(Vue as any).router = router;

export default router;
export { routes };
