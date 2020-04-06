<template>
  <v-layout flex align-center justify-center>
    <v-flex xs12 sm4 elevation-6>
      <v-toolbar color="indigo darken-2" dark flat>
        <v-toolbar-title>Belépés</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-card-text class="pt-4">
          <div>
            <v-form
              ref="form"
              v-model="valid"
              method="POST"
              @submit.prevent="login"
            >
              <input type="hidden" v-bind:value="csrf" name="_token" />
              <v-autocomplete
                :items="schools"
                :loading="loading"
                v-model="school"
                item-text="name"
                item-value="code"
                label="Iskola"
                :rules="schoolRules"
                required
              ></v-autocomplete>
              <v-text-field
                name="username"
                label="Felhaszálónév"
                autocomplete="username"
                v-model="username"
                :rules="unRules"
                required
              ></v-text-field>
              <v-text-field
                name="password"
                label="Jelszó"
                v-model="password"
                :append-icon="e1 ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="() => (e1 = !e1)"
                v-on:focus="errorMsg = ''"
                :type="e1 ? 'password' : 'text'"
                :rules="passwordRules"
                autocomplete="current-password"
                counter
                required
                :error-messages="errorMsg"
                v-on:keyup.enter="login"
              ></v-text-field>
              <v-checkbox
                label="Emlékezz rám"
                name="remember"
                v-model="rememberMe"
              ></v-checkbox>
              <v-layout justify-space-between>
                <v-btn
                  @click="login"
                  :class="{
                    'blue darken-4 white--text': valid && !loading,
                    disabled: !valid || loading
                  }"
                  >Belépés</v-btn
                >
              </v-layout>
            </v-form>
          </div>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import Mixin from '@/mixins';
import Component, { mixins } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
@Component({
  metaInfo: {
    title: 'Belépés'
  }
})
export default class LoginComponent extends mixins(Mixin) {
  @Prop(String) readonly csrf: string | undefined;
  @Prop(Array) readonly errors: any;
  public $refs!: {
    form: HTMLFormElement;
  };
  valid = false;
  e1 = true;
  password = '';
  passwordRules = [v => !!v || 'Jelszó megadása kötelező'];
  username = '';
  unRules = [v => !!v || 'Felhasználónév megadása kötelező'];
  school = '';
  schoolRules = [v => !!v || 'Iskola megadása kötelező'];
  rememberMe = false;
  errorMsg = '';
  schools = [];
  loading = true;

  mounted() {
    if (this.$store.getters['auth/isAuthenticated']) {
      this.$router.push('/');
    }
    let self = this;
    this.$http.get('schools').then(response => {
      self.schools = response.data;
      this.school = `${this.$route.query.school}` ?? '';
      self.loading = false;
    });
  }
  login() {
    if (this.$refs.form.validate()) {
      this.loading = true;
      this.$store
        .dispatch('auth/login', {
          school: this.school ?? '',
          username: this.username,
          password: this.password,
          rme: this.rememberMe
        })
        .then(() => {
          this.loading = false;
          this.$router.push('/');
        })
        .catch(err => {
          this.loading = false;
          const response = err.response;
          if (response && response.status === 401) {
            this.errorMsg = response.data?.error ?? '';
          } else throw err;
        });
    }
  }
  clear() {
    this.$refs.form.reset();
  }
}
</script>
