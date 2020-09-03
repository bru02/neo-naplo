export interface GeneralAPI {
  id: number;
  name: string;
  nameOfBirth: string;
  placeOfBirth: string;
  mothersName: string;
  addressDataList: string[];
  dateOfBirth: number;
  instituteName: string;
  instituteCode: string;
  evaluations: Evaluation[];
  subjectAverages: null;
  absences: Absence[];
  notes: Note[];
  osztalyCsoportok: OsztalyCsoport[];
  events: Event[];
  osztalyfonokok: Osztalyfonok[];
  tutelaries: Tutelary[];
  classAverages: ClassAverage[];
  //tanuloAktualisOktatasNevelesiKategoriaja: educationCategory
}
// export enum educationCategory {
//   Alapkepzes = "Alapkepzes",
//   Felnottkepzes = "Felnottkepzes",
//   AlapfokuMuveszetoktatas = "AlapfokuMuveszetoktatas",
//   Kollegium = "Kollegium",
//   EGYMI = "EGYMI",
//   Vegyeskepzes = "Vegyeskepzes",
//   NemAlapkepzes = "NemAlapkepzes",
//   None = "None"
// }

export interface Absence {
  id: number;
  type: ItemType;
  typeName: ItemTypeName;
  mode: Mode;
  modeName: ModeName;
  subject: string;
  subjectCategory: null;
  subjectCategoryName: string;
  delayTimeMinutes: number;
  teacher: string;
  numberOfLessons: number;
  creatingTime: number;
  justificationState: JustificationState;
  justificationStateName: string;
  justificationType: JustificationType;
  justificationTypeName: string;
  seenByTutelary: boolean | number;
  osztalyCsoportUid: string;
  date: number;
}

export enum JustificationState {
  BeJustified = 'BeJustified',
  Justified = 'Justified',
  UnJustified = 'UnJustified'
}

export enum JustificationType {
  Parental = 'Parental',
  Takeout = 'Takeout',
  UnJustified = 'UnJustified'
}

export enum JustificationTypeName {
  Igazolatlan = 'Igazolatlan',
  Kikérő = 'Kikérő',
  SzülőiIgazolás = 'Szülői igazolás'
}

export enum Mode {
  Lesson = 'Lesson',
  OutsideLesson = 'OutsideLesson'
}

export enum ModeName {
  TanóraiMulasztás = 'Tanórai mulasztás',
  TanóránKívüliMulasztás = 'Tanórán kívüli mulasztás'
}

export enum ItemType {
  Absence = 'Absence',
  Delay = 'Delay'
}

export enum ItemTypeName {
  Hiányzás = 'Hiányzás'
}

export interface ClassAverage {
  subject: string;
  value: null;
}

export interface Evaluation {
  id: number;
  form: Form;
  type: EvaluationType;
  typeName: string;
  subject: string;
  subjectCategoryName: string;
  theme: string;
  isAtlagbaBeleszamit: boolean;
  mode: string;
  weight: Weight;
  value: string;
  numberValue: number | string;
  seenByTutelary: boolean | number;
  teacher: string;
  date: number;
  creatingTime: number;
  jellegNev: string;
  osztalyCsoportUid: string;
}

export enum Form {
  Mark = 'Mark',
  Percent = 'Percent',
  Diligence = 'Diligence',
  Deportment = 'Deportment',
  Text = 'Text'
}

export enum EvaluationType {
  MidYear = 'MidYear',
  QuarterEvaluation = 'QuarterEvaluation',
  HalfYear = 'HalfYear',
  EndYear = 'EndYear'
}

export enum Weight {
  The100 = '100%',
  The200 = '200%',
  The50 = '50%',
  Na = '-'
}

export interface Event {
  date: number;
  title: string;
  content: string;
  teacher: string;
  attachments: Attachment[];
  id: string;
  endDate: number;
}

export interface Attachment {
  title: string;
  url: string;
}

export interface Note {
  id: number;
  type: string;
  title: string;
  content: string;
  seenByTutelary: boolean | number;
  teacher: string;
  date: number;
  creatingTime: number;
  osztalyCsoportUid: string;
}

export interface OsztalyCsoport {
  oktatasNevelesiFeladat: OktatasNevelesiFeladat;
  nev: string;
  osztalyCsoportTipus: string;
  isAktiv: boolean;
  uid: string;
  osztalyfonokUid: null | string;
}

export interface OktatasNevelesiFeladat {
  uid: string;
  leiras: string;
  nev: string;
}

export interface Osztalyfonok {
  uid: string;
  tanar: Tanar;
  osztalyai: Osztalyai[];
}

export interface Osztalyai {
  uid: string;
  nev: string;
}

export interface Tanar {
  uid: string;
  alkalmazott: Alkalmazott;
}

export interface Alkalmazott {
  uid: string;
  nev: string;
  telefonok: PhoneNumber[];
  emailek: Email[];
}
export interface Email {
  uid: string;
  email: string;
  isAlapertelmezett: boolean;
  tipus: string;
}
export interface PhoneNumber {
  uid: string;
  telefonszam: string;
  isAlapertelmezett: boolean;
  tipus: string;
}
export interface Tutelary {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

// Timetable
export interface TimetableAPI {
  [key: number]: Lesson[];
}
export interface Lesson {
  id: number;
  calendarOraType: CalendarOraType;
  count: number;
  date: number;
  startTime: number;
  endTime: number;
  subject: string;
  subjectCategory: null;
  subjectCategoryName: string;
  classRoom: string;
  osztalyCsoportUid: string;
  classGroup: string;
  teacher: string;
  deputyTeacher: string;
  state: State;
  stateName: string;
  presenceType: string;
  presenceTypeName: string;
  teacherHomeworkId: null | boolean;
  isTanuloHaziFeladatEnabled: boolean;
  bejelentettSzamonkeresIdList: Exam[];
  theme: string;
  nev: string;
  homework: null | string;
}

export enum CalendarOraType {
  OrarendiOra = 'OrarendiOra',
  TanitasiOra = 'TanitasiOra',
  UresOra = 'UresOra'
}

export enum State {
  Missed = 'Missed',
  NotRegistered = 'NotRegistered',
  Registered = 'Registered'
}

export interface Exam {
  id?: number | string;
  date: number;
  count: string;
  subject: string;
  teacher: string;
  name: string;
  type: string;
  creatingTime: number;
  osztalyCsoportUid: string;
}
