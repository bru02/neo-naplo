import store from '@/store';
import linkifyHtml from 'linkifyjs/html';
import { getWeek } from './utils/evaluations';
const utc2date = (value: number | Date): Date => {
    return value instanceof Date ? value : new Date(value * 1000);
  },
  day = (utc: number | Date): String => {
    return [
      'Vasárnap',
      'Hétfő',
      'Kedd',
      'Szerda',
      'Csütörtök',
      'Péntek',
      'Szombat',
    ][utc2date(utc).getDay()];
  },
  leadingZero = (n: number) => {
    return `0${n}`.slice(-2);
  },
  formatDate = (value: number | Date, appendDay = true): String => {
    let date = utc2date(value);
    return `${
      date.getFullYear() === new Date().getFullYear()
        ? ''
        : `${date.getFullYear()}. `
    }${leadingZero(date.getMonth() + 1)}. ${leadingZero(date.getDate())}.${
      appendDay ? `, ${day(value)}` : ''
    }`;
  },
  formatTime = (utc: number): String => {
    const date = utc2date(utc);
    return `${leadingZero(date.getHours())}:${leadingZero(date.getMinutes())}`;
  };
export function isDark(bgColor: string) {
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor,
    r = parseInt(color.substring(0, 2), 16), // hexToR
    g = parseInt(color.substring(2, 4), 16), // hexToG
    b = parseInt(color.substring(4, 6), 16), // hexToB
    uicolors = [r / 255, g / 255, b / 255],
    c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L < 0.5; // 179
}

export function formatText(text: string) {
  return linkifyHtml(text, {
    defaultProtocol: 'https',
    nl2br: true,
  });
}

export function trimText(text: string) {
  return text.substr(0, 100) + (text.length > 100 ? '...' : '');
}

export function getLessonUrl(date, numberOfLessons) {
  const getMonday = (utc) => {
    const d = new Date(utc);
    const day = d.getDay(),
      diff = d.getDate() - day + 1;
    return +new Date(d.setDate(diff));
  };
  return `/timetable/${Math.round(
    (getMonday(date * 1000) - getMonday(+new Date())) / 604800000
  )}/${date}:${numberOfLessons}`;
}
export { formatDate, day, utc2date, formatTime };

export async function obtain(
  what:
    | 'general'
    | 'timetable'
    | 'events'
    | 'hirdetmenyek'
    | 'classAverages'
    | 'exams',
  w = 0
) {
  let resource = store.state.api[what],
    arg: any;
  if (what === 'timetable') {
    arg = getWeek(w);
    // @ts-ignore
    resource = store.state.api.timetable[`${arg.from}-${arg.to}`];
  } else if (what === 'hirdetmenyek') {
    arg = await obtain('general').then(
      (d) =>
        d.osztalyCsoportok.find((o) => o.osztalyCsoportTipus === 'Osztaly').nev
    );
  }
  if (resource && !resource.loading && resource.loaded) return resource.data;

  return store.dispatch(
    `api/pull${what.charAt(0).toUpperCase() + what.slice(1)}`,
    arg
  );
}
