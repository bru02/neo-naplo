import Mixin from '@/mixins';
declare const LoginComponent_base: import("vue-class-component/lib/declarations").VueClass<Mixin>;
export default class LoginComponent extends LoginComponent_base {
    readonly csrf: string | undefined;
    readonly errors: any;
    $refs: {
        form: HTMLFormElement;
    };
    valid: boolean;
    e1: boolean;
    password: string;
    passwordRules: ((v: any) => true | "Jelszó megadása kötelező")[];
    username: string;
    unRules: ((v: any) => true | "Felhasználónév megadása kötelező")[];
    school: string;
    schoolRules: ((v: any) => true | "Iskola megadása kötelező")[];
    rememberMe: boolean;
    schools: never[];
    loading: boolean;
    mounted(): void;
    login(): void;
    clear(): void;
}
export {};
