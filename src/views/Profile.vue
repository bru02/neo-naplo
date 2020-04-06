<template>
  <v-container>
    <v-skeleton-loader
      :loading="loading"
      type="card, list-item-avatar-two-line, list-item-avatar-two-line, list-item-avatar-two-line, list-item, list-item-avatar, list-item-avatar, list-item-avatar"
    >
      <v-img src="@/assets/profile-bg.jpg?vuetify-preload" height="300px" dark>
        <v-row class="fill-height">
          <v-spacer></v-spacer>

          <v-card-title class="white--text pl-12 pt-12">
            <div class="display-1 pl-12 pt-12">{{ general.name }}</div>
          </v-card-title>
        </v-row>
      </v-img>

      <v-list>
        <v-list-item>
          <v-list-item-action>
            <v-icon color="indigo">mdi-account-supervisor</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{ general.mothersName }}</v-list-item-title>
            <v-list-item-subtitle>Anyja neve</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider inset></v-divider>

        <v-list-item>
          <v-list-item-action>
            <v-icon color="indigo">mdi-school</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{ general.instituteName }}</v-list-item-title>
            <v-list-item-subtitle>Iskola</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <!-- <v-list-item>
        <v-list-item-action></v-list-item-action>

        <v-list-item-content>
          <v-list-item-title>{{ general.tanuloAktualisOktatasNevelesiKategoriaja }}</v-list-item-title>
          <v-list-item-subtitle>Aktuális oktatási kategória</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item> -->
        <v-divider inset></v-divider>

        <!-- Születés -->
        <v-list-item>
          <v-list-item-icon>
            <v-icon color="indigo">mdi-home-heart</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ general.placeOfBirth }}</v-list-item-title>
            <v-list-item-subtitle>Születési hely</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-action></v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{
              formatDate(general.dateOfBirth)
            }}</v-list-item-title>
            <v-list-item-subtitle>Születési idő</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-show="general.name != general.nameOfBirth">
          <v-list-item-action></v-list-item-action>

          <v-list-item-content>
            <v-list-item-title>{{ general.nameOfBirth }}</v-list-item-title>
            <v-list-item-subtitle>Születési név</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="(address, index) in general.addressDataList"
          :key="index"
        >
          <v-list-item-icon>
            <v-icon color="indigo" v-show="index == 0">mdi-map-marker</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ address }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- Gondviselők -->
        <v-list-group>
          <template v-slot:prependIcon>
            <v-icon color="indigo">mdi-account-group</v-icon>
          </template>
          <template v-slot:activator>
            <v-list-item-title>Gondviselők</v-list-item-title>
          </template>

          <v-list-group
            sub-group
            no-action
            v-for="tutelary in general.tutelaries"
            :key="tutelary.id"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{ tutelary.name }}</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              v-for="(contact, i) in contacts(tutelary)"
              :key="i"
              :href="contact.href"
            >
              <v-list-item-icon>
                <v-icon v-text="contact.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-title v-text="contact.title"></v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list-group>
        <!--  OSZTÁLY FÖNÖKÖK -->
        <v-list-group>
          <template v-slot:prependIcon>
            <v-icon color="indigo">mdi-account</v-icon>
          </template>
          <template v-slot:activator>
            <v-list-item-title>Osztályfönökök</v-list-item-title>
          </template>

          <v-list-group
            sub-group
            no-action
            v-for="teacher in general.osztalyfonokok"
            :key="teacher.uid"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{
                  teacher.tanar.alkalmazott.nev
                }}</v-list-item-title>
                <v-list-item-subtitle
                  v-html="getClassGroup(teacher)"
                ></v-list-item-subtitle>
              </v-list-item-content>
            </template>
            <v-list-item
              v-for="phoneNumber in teacher.tanar.alkalmazott.telefonok.filter(
                p => p.tipus == 'PublikusTelefonszam'
              )"
              :key="phoneNumber.uid"
              :href="`${mobile ? 'tel' : 'callto'}:${phoneNumber.telefonszam}`"
            >
              <v-list-item-icon>
                <v-icon v-show="i == 0"></v-icon>
              </v-list-item-icon>
              <v-list-item-title>{{
                phoneNumber.telefonszam
              }}</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-for="email in teacher.tanar.alkalmazott.emailek.filter(
                e => e.tipus == 'PublikusEmailcim'
              )"
              :key="email.uid"
              :href="`mailto:${email.email}`"
            >
              <v-list-item-icon>
                <v-icon v-show="i == 0"></v-icon>
              </v-list-item-icon>
              <v-list-item-title>{{ email.email }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list-group>
      </v-list>
    </v-skeleton-loader>
  </v-container>
</template>
<script lang="ts">
import Mixin from '@/mixins';
import { apiMapper } from '@/store';
import Component, { mixins } from 'vue-class-component';
import { GeneralAPI, OsztalyCsoport, Tutelary } from '../api-types';
@Component({
  computed: apiMapper.mapState({
    general: state => state.general.data
  }),
  metaInfo: {
    title: 'Profil'
  }
})
export default class Profile extends mixins(Mixin) {
  general!: GeneralAPI;
  loading = true;
  mounted() {
    this.obtain('general').then(() => (this.loading = false));
  }
  contacts(obj: Tutelary) {
    let ret: any[] = [];
    if (obj) {
      if (obj.phoneNumber) {
        ret.push({
          title: obj.phoneNumber,
          icon: 'mdi-phone',
          href: `${this.mobile ? 'tel' : 'callto'}:${obj.phoneNumber}`
        });
      }
      if (obj.email) {
        ret.push({
          title: obj.email,
          icon: 'mdi-email',
          href: `mailto:${obj.email}`
        });
      }
    }
    return ret;
  }
  getClassGroup(teacher) {
    let classGroup;
    for (const cg of this.general.osztalyCsoportok) {
      if (cg.osztalyfonokUid == teacher.uid) {
        classGroup = cg;
        break;
      }
    }
    if (!classGroup) return '';
    return `<span class='text--primary'>${classGroup.nev}</span> &mdash; ${classGroup.oktatasNevelesiFeladat.leiras}`;
  }
}
</script>
