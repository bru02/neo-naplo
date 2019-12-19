import { ApiState } from '@/store/modules/api';

import { Lesson } from './api-types.d';
import Vue from 'vue';
import { apiMapper, timeMapper } from '@/store';
import Component from 'vue-class-component';
import { toldyLink, formatDate, day, formatTime, utc2date } from './helpers';
import { JustificationState, Note, Evaluation, Absence } from './api-types';
import group from '@/utils';
@Component({
  computed: {
    ...apiMapper.mapState({
      state: state => state
    }),
    ...timeMapper.mapGetters(['time', 'date'])
  }
})
export default class Mixin extends Vue {
  state!: ApiState;
  time!: Date;
  date!: Date;

  getEvaluationColor(nv: number) {
    if (nv >= 4.5) return 'darken-1 green';
    if (nv >= 3.5) return 'darken-1 light-green';
    if (nv >= 2.5) return 'darken-2 lime';
    if (nv >= 1.5) return 'darken-3 amber';
    return 'darken-4 deep-orange';
  }

  getAverage(evaluations) {
    if (!evaluations.length) return 0;
    let sum = 0,
      n = 0;
    for (const evaluation of evaluations) {
      if (evaluation.isAtlagbaBeleszamit && evaluation.form == 'Mark') {
        let weight = +evaluation.weight.slice(0, -1);
        sum += weight * +evaluation.numberValue;
        n += weight;
      }
    }
    return Math.round((100 * sum) / n) / 100;
  }

  getAbsenceColor(justificationState: JustificationState) {
    return {
      Justified: 'darken-1 green',
      BeJustified: 'darken-3 amber',
      UnJustified: 'darken-4 deep-orange'
    }[justificationState];
  }
  getKey(item) {
    return `${item.id}-${item.date}`;
  }
  noteValues({
    content,
    type,
    title,
    date,
    teacher,
    creatingTime,
    osztalyCsoportUid
  }: Note) {
    return {
      Tartalom: content,
      Típus: type,
      Cím: title,
      Dátum: this.formatDate(date),
      Tanár: this.toldyLink(teacher),
      'Naplózás dátuma': `${this.formatDate(creatingTime)}, ${this.formatTime(
        creatingTime
      )}`,
      Osztálycsoport: this.getClassGroupTextFromUID(osztalyCsoportUid)
    };
  }
  evalValues({
    value,
    weight,
    theme,
    subject,
    mode,
    typeName,
    date,
    teacher,
    creatingTime,
    osztalyCsoportUid
  }: Evaluation) {
    return {
      Jegy: `${value} (${weight})`,
      Téma: theme || '-',
      Tantárgy: subject,
      Mód: mode,
      Típus: typeName,
      Dátum: this.formatDate(date),
      Tanár: this.toldyLink(teacher),
      'Naplózás dátuma': `${this.formatDate(creatingTime)}, ${this.formatTime(
        creatingTime
      )}`,
      Osztálycsoport: this.getClassGroupTextFromUID(osztalyCsoportUid)
    };
  }
  lessonValues({
    date,
    startTime,
    endTime,
    teacher,
    deputyTeacher,
    subject,
    theme,
    homework,
    classRoom,
    count,
    presenceTypeName,
    osztalyCsoportUid
  }: Lesson) {
    return {
      Időpont: `${count}. óra, ${this.formatDate(date)}; ${this.formatTime(
        startTime,
        false
      )} - ${this.formatTime(endTime, false)}`,
      Tantárgy: subject,
      Téma: theme,
      Tanár: this.toldyLink(
        deputyTeacher ? `Helyettesítő: ${deputyTeacher}` : teacher
      ),
      Terem: classRoom,
      Házi: homework,
      Jelenlét: presenceTypeName,
      Osztálycsoport: this.getClassGroupTextFromUID(osztalyCsoportUid)
    };
  }
  absenceValues({
    typeName,
    type,
    subject,
    date,
    justificationTypeName,
    teacher,
    creatingTime,
    delayTimeMinutes,
    numberOfLessons,
    osztalyCsoportUid
  }: Absence) {
    return {
      Típus: typeName + (type == 'Delay' ? `(${delayTimeMinutes} perc)` : ''),
      Tantárgy: subject,
      Dátum: `${this.formatDate(date)}; ${numberOfLessons}. óra`,
      'Igazolás típusa': justificationTypeName,
      Tanár: this.toldyLink(teacher),
      'Naplózás dátuma': `${this.formatDate(creatingTime)}, ${this.formatTime(
        creatingTime
      )}`,
      Osztálycsoport: this.getClassGroupTextFromUID(osztalyCsoportUid),
      '': {
        title: 'Óra megtekintése',
        arg: { date, numberOfLessons },
        cb: ({ date, numberOfLessons }) => {
          const getMonday = utc => {
            const d = new Date(utc);
            const day = d.getDay(),
              diff = d.getDate() - day + (day == 0 ? -6 : 1);
            return +new Date(d.setDate(diff));
          };
          this.$router.push(
            `/timetable/${Math.round(
              (getMonday(date * 1000) - getMonday(this.date)) / 604800000
            )}/${date}:${numberOfLessons}`
          );
        }
      }
    };
  }
  eventValues({ content, date, endDate, attachments = [] }) {
    return Object.fromEntries([
      ['Tartalom', content.replace(/\n/gm, '<br/>')],
      ['Dátum', this.formatDate(date)],
      ['Utoljára látható', this.formatDate(endDate)],
      ...attachments.map((a, i) => {
        return [
          `Csatolmány${new Array(i + 1).join('&nbsp;')}`,
          // @ts-ignore: type never bs
          `<a href="${a.url}" target="_blank">${a.title}</a>`
        ];
      })
    ]);
  }
  getWeek(week: number) {
    function _format(d: Date): string {
      return `${d.getFullYear()}-${`0${d.getMonth() + 1}`.slice(
        -2
      )}-${`0${d.getDate() + 1}`.slice(-2)}`;
    }
    let now = new Date(this.date);
    now.setDate(now.getDate() + week * 7);
    let monday = new Date(now);
    monday.setDate(monday.getDate() - monday.getDay() - 1);
    let sunday = new Date(now);
    sunday.setDate(sunday.getDate() - sunday.getDay() + 5);
    return { from: _format(monday), to: _format(sunday) };
  }
  get mobile() {
    return innerWidth < 600;
  }

  getClassGroupTextFromUID(uid) {
    let classGroup;
    for (const cg of this.state.general.data.osztalyCsoportok || []) {
      if (cg.uid == uid) {
        classGroup = cg;
        break;
      }
    }
    if (!classGroup) return '';
    return `<span class='text--primary'>${classGroup.nev}</span> &mdash; ${classGroup.oktatasNevelesiFeladat.leiras}`;
  }

  async obtain(what: 'general' | 'timetable', w = 0) {
    let resource = this.state[what],
      week: any;
    if (what == 'timetable') {
      week = this.getWeek(w);
      resource = this.state.timetable[`${week.from}-${week.to}`];
    }
    if (
      resource &&
      !resource.loading &&
      resource.data &&
      (what == 'general' ? !!resource.data.id : true)
    )
      return resource.data;

    return this.$store.dispatch(
      `api/pull${what.charAt(0).toUpperCase() + what.slice(1)}`,
      week
    );
  }

  debounce(func: Function, wait: number, immediate: boolean) {
    var timeout;
    return () => {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  toldyLink = toldyLink;
  formatDate = formatDate;
  formatTime = formatTime;
  utc2date = utc2date;
  day = day;

  getSubjectIcon(subjectCategoryName) {
    const map = {
      'Állampolgári ismeretek': 'mdi-account-badge-horizontal-outline',
      'Diákotthoni feladat': 'mdi-notebook-outline',
      'Gyermekotthoni feladat': 'mdi-notebook-outline',
      Napközi: 'mdi-notebook-outline',
      'Életvitel és gyakorlat': 'mdi-lightbulb-on-outline',
      Filozófia: 'mdi-lightbulb-on-outline',
      Fizika: 'mdi-atom',
      Földrajz: 'mdi-globe-model',
      'Földünk – környezetünk': 'mdi-globe-model',
      Háztartástan: 'mdi-home-alert',
      Etika: 'mdi-scale-balance', // Nincs kép
      'Hit- és erkölcstan': 'mdi-scale-balance',
      'Hon- és népismeret': 'mdi-flag-variant',
      Kémia: 'mdi-flask',
      Könyvtárhasználat: 'mdi-library',
      Környezetismeret: 'mdi-leaf-maple',
      'Magyar nyelv és irodalom': 'mdi-book-open-page-variant',
      Matematika: 'mdi-calculator-variant',
      'Mozógképkultúra és médiaismeret': 'mdi-image-search-outline',
      Művészetek: 'mdi-palette-outline',
      'Osztályfőnöki, élet- és pályatervezés': 'mdi-rocket',
      'Óvódai feladat': 'mdi-rabbit', // Nincs kép
      'Technika, életvitel és gyakorlat': 'mdi-scissors-cutting',
      'Testnevelés és sport': 'mdi-basketball',
      Történelem: 'mdi-owl'
    };
    if (subjectCategoryName in map) return map[subjectCategoryName];
    let icon = 'mdi-book';
    if (subjectCategoryName.indexOf('nyelv') > -1) icon = 'mdi-headset';
    else if (subjectCategoryName.indexOf('Biológia') > -1) icon = 'mdi-dna';
    else if (subjectCategoryName.indexOf('Dráma') > -1)
      icon = 'mdi-drama-masks';
    else if (subjectCategoryName.indexOf('Ember') > -1)
      icon = 'mdi-human-male-height';
    else if (
      subjectCategoryName.indexOf('Informatika') > -1 ||
      subjectCategoryName.indexOf('Számítástechnika') > -1
    )
      icon = 'mdi-monitor';
    else if (
      subjectCategoryName.indexOf('Művészet') > -1 ||
      subjectCategoryName.indexOf('Vizuális kultúra') > -1
    )
      icon = 'mdi-palette-outline';
    else if (subjectCategoryName.indexOf('Szakma') > -1)
      icon = 'mdi-folder-alert-outliner';
    // nincs kép
    else if (
      subjectCategoryName.indexOf('egészségügy') > -1 ||
      subjectCategoryName.indexOf('szociális szolgáltatások') > -1
    )
      icon = 'mdi-folder-heart-outline';
    // nincs kép
    else if (subjectCategoryName.indexOf('elektronika') > -1)
      icon = 'mdi-led-on';
    else if (subjectCategoryName.indexOf('élelmiszer') > -1) icon = 'mdi-food';
    else if (subjectCategoryName.indexOf('építészet') > -1)
      icon = 'mdi-office-building';
    else if (subjectCategoryName.indexOf('faipar') > -1)
      icon = 'mdi-tree-outline';
    else if (subjectCategoryName.indexOf('gépészet') > -1)
      icon = 'mdi-slot-machine-outline';
    else if (subjectCategoryName.indexOf('kerskedelem') > -1) icon = 'mdi-cash';
    else if (subjectCategoryName.indexOf('vízgazdálkodás') > -1)
      icon = 'mdi-cup-water';
    else if (subjectCategoryName.indexOf('közgazdaságtan') > -1)
      icon = 'mdi-chart-areaspline';
    // nincs kép
    else if (subjectCategoryName.indexOf('közlekedés') > -1) icon = 'mdi-bus';
    else if (subjectCategoryName.indexOf('mezőgazdaság') > -1)
      icon = 'mdi-food-apple-outline';
    else if (subjectCategoryName.indexOf('nyomda') > -1)
      icon = 'mdi-newspaper-variant-multiple-outline';
    else if (subjectCategoryName.indexOf('oktatás') > -1)
      icon = 'mdi-school-outline';
    else if (subjectCategoryName.indexOf('orientáció') > -1)
      icon = 'mdi-rocket';
    else if (subjectCategoryName.indexOf('vegyipar') > -1) icon = 'mdi-flask';
    else if (subjectCategoryName.indexOf('orientáció') > -1)
      icon = 'mdi-rocket';
    else if (subjectCategoryName.indexOf('vendéglátás') > -1)
      icon = 'mdi-hotel';
    else if (subjectCategoryName.indexOf('Társadalmi') > -1)
      icon = 'mdi-account-badge-horizontal-outline';
    else if (subjectCategoryName.indexOf('természet') > -1)
      icon = 'mdi-leaf-maple';
    else if (subjectCategoryName.indexOf('zene') > -1) icon = 'mdi-music';
    return icon;
  }
  getEvaluationIcon(mode: string) {
    let icon = 'mdi-help-circle-outline';
    switch (mode) {
      case 'Írásbeli témazáró dolgozat':
      case 'Témazáró':
        icon = 'mdi-widgets';
        break;
      case 'Írásbeli röpdolgozat':
        icon = 'mdi-border-color';
        break;
      case 'Dolgozat':
      case 'Beszámoló':
        icon = 'mdi-text-subject';
        break;
      case 'Projektmunka':
        icon = 'mdi-clipboard-text';
        break;
      case 'Gyakorlati feladat':
        icon = 'mdi-walk';
        break;
      case 'Szódolgozat':
        icon = 'mdi-flag-variant';
        break;
      case 'Szóbeli felelet':
        icon = 'mdi-human-greeting';
        break;
      case 'Házi feladat':
        icon = 'mdi-home';
        break;
      case 'Órai munka':
        icon = 'mdi-school';
        break;
      case 'Versenyen, vetélkedőn való részvétel':
        icon = 'mdi-account-star-outline';
        break;
      case 'Magyar nyelv évfolyamdolgozat':
        icon = 'mdi-book';
        break;
      case 'év végi':
        icon = 'mdi-flag-checkered';
        break;
      case 'Házi dolgozat':
        icon = 'mdi-file-outline';
        break;
    }
    return icon;
  }
  group = group;
}
