import Vue from 'vue';
import { JustificationState, Note, Evaluation, Item } from './api-types';
export default class Mixin extends Vue {
    group(arr: any[], key: string): {};
    getAbsenceColor(justificationState: JustificationState): string;
    getKey(item: any): string;
    noteValues({ content, type, title, date, teacher, creatingTime }: Note): {
        'Tartalom': string;
        'Típus': string;
        'Cím': string;
        'Dátum': String;
        'Tanár': string;
        'Naplózás dátuma': String;
    };
    evalValues({ value, weight, theme, subject, mode, typeName, date, teacher, creatingTime }: Evaluation): {
        'Jegy': string;
        'Téma': string;
        'Tantárgy': string;
        'Mód': import("./api-types").EvaluationMode | null;
        'Típus': import("./api-types").EvaluationTypeName;
        'Dátum': String;
        'Tanár': string;
        'Naplózás dátuma': String;
    };
    lessonValues({ date, startTime, endTime, teacher, deputyTeacher, subject, theme, homework, classRoom, count }: {
        date: any;
        startTime: any;
        endTime: any;
        teacher: any;
        deputyTeacher: any;
        subject: any;
        theme: any;
        homework: any;
        classRoom: any;
        count: any;
    }): {
        'Időpont': string;
        'Tantárgy': any;
        'Téma': any;
        'Tanár': string;
        'Terem': any;
        'Házi': any;
    };
    absenceValues({ typeName, subject, date, justificationTypeName, teacher, creatingTime }: Item): {
        'Típus': import("./api-types").ItemTypeName;
        'Tantárgy': string;
        'Dátum': String;
        'Igazolás típusa': import("./api-types").JustificationTypeName;
        'Tanár': string;
        'Naplózás dátuma': String;
    };
    eventValues({ content, date, endDate }: {
        content: any;
        date: any;
        endDate: any;
    }): {
        'Tartalom': any;
        'Dátum': String;
        'Utoljára látható': String;
    };
    getWeek(week: number): {
        from: string;
        to: string;
    };
    readonly mobile: boolean;
    toldyLink: (value: string) => string;
    formatDate: (value: number) => String;
    formatTime: (utc: number) => String;
    day: (utc: number) => String;
}
