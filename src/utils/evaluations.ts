import { Evaluation, OsztalyCsoport, EvaluationType } from './../api-types.d';
export function getAverage(evaluations: Evaluation[]) {
  let sum = 0,
    n = 0;
  for (const evaluation of evaluations) {
    if (evaluation.isAtlagbaBeleszamit && evaluation.form === 'Mark') {
      let weight = +evaluation.weight.slice(0, -1);
      sum += weight * +evaluation.numberValue;
      n += weight;
    }
  }
  if (n === 0) return 0;
  return Math.round((100 * sum) / n) / 100;
}

export function getWeek(week: number) {
  function _format(d: Date): string {
    return `${d.getFullYear()}-${`0${d.getMonth() + 1}`.slice(
      -2
    )}-${`0${d.getDate()}`.slice(-2)}`;
  }
  let now = new Date(/*this.date*/);
  now.setDate(now.getDate() + week * 7);
  let monday = new Date(+now - now.getDay() * 86400000);
  let sunday = new Date(+now - (now.getDay() - 6) * 86400000);
  return { from: _format(monday), to: _format(sunday) };
}

export function getClassGroupTextFromUID(
  uid: string,
  classGroups: OsztalyCsoport[]
) {
  let classGroup;
  for (const cg of classGroups) {
    if (cg.uid === uid) {
      classGroup = cg;
      break;
    }
  }
  if (!classGroup) return '';
  return `<span class='text--primary'>${classGroup.nev}</span> &mdash; ${classGroup.oktatasNevelesiFeladat.leiras}`;
}

export function getEvaluationTypeName(type: EvaluationType) {
  return {
    EndYear: 'Évvégi',
    HalfYear: 'Félévi',
    IQuarterEvaluation: 'Negyedéves',
    IIIQuarterEvaluation: 'Negyedéves'
  }[type];
}

export function getSubjectIcon(scm: string | null) {
  const subjectCategoryName = scm || '',
    map = {
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
  else if (subjectCategoryName.indexOf('Dráma') > -1) icon = 'mdi-drama-masks';
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
  else if (subjectCategoryName.indexOf('elektronika') > -1) icon = 'mdi-led-on';
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
  else if (subjectCategoryName.indexOf('orientáció') > -1) icon = 'mdi-rocket';
  else if (subjectCategoryName.indexOf('vegyipar') > -1) icon = 'mdi-flask';
  else if (subjectCategoryName.indexOf('orientáció') > -1) icon = 'mdi-rocket';
  else if (subjectCategoryName.indexOf('vendéglátás') > -1) icon = 'mdi-hotel';
  else if (subjectCategoryName.indexOf('Társadalmi') > -1)
    icon = 'mdi-account-badge-horizontal-outline';
  else if (subjectCategoryName.indexOf('természet') > -1)
    icon = 'mdi-leaf-maple';
  else if (subjectCategoryName.indexOf('zene') > -1) icon = 'mdi-music';
  return icon;
}

export function getEvaluationIcon(mode: string) {
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

export function getEvalValue(nv: number | any) {
  return (
    {
      1: 'Elégtelen',
      1.5: 'Egy-ketted',
      2: 'Elégséges',
      2.5: 'Két-harmad',
      3: 'Közepes',
      3.5: 'Három-negyed',
      4: 'Jó',
      4.5: 'Négy-ötöd',
      5: 'Jeles'
    }[nv] ?? 'Szöveges értékelés'
  );
}
