import { OsztalyCsoport, JustificationState } from './api-types.d';
import { ApiState } from '@/store/modules/api';

import Vue from 'vue';
import { apiMapper, timeMapper } from '@/store';
import Component from 'vue-class-component';
import { formatText, isDark, trimText, obtain } from './helpers';
import {
  getSubjectIcon,
  getEvaluationIcon,
  getAverage,
  getClassGroupTextFromUID,
} from './utils/evaluations';
@Component({
  computed: {
    ...apiMapper.mapState({
      state: (state) => state,
      osztalyCsoportok: (state) => state.general.data.osztalyCsoportok,
    }),
    ...timeMapper.mapGetters(['time', 'date']),
  },
})
export default class Mixin extends Vue {
  state!: ApiState;
  time!: Date;
  date!: Date;
  osztalyCsoportok!: OsztalyCsoport[];

  getEvaluationColor(nv: number | null) {
    const colors = this.$store.state.settings.evaluationColors;
    if (!nv) return colors.default;
    for (let i = 4.5; i > 0; i -= 1) {
      if (nv >= i) {
        return colors[i + 0.5];
      }
    }
    return colors.default;
  }

  getAbsenceColor(justificationState: JustificationState) {
    const colors = this.$store.state.settings.evaluationColors;

    return {
      Justified: colors[5],
      BeJustified: colors[2],
      UnJustified: colors[1],
    }[justificationState];
  }

  get mobile() {
    // @ts-ignore
    return this.$vuetify.breakpoint.smAndDown;
  }

  obtain = obtain;

  getSubjectIcon = getSubjectIcon;
  getEvaluationIcon = getEvaluationIcon;
  trimText = trimText;
  isDark = isDark;
  formatText = formatText;
  getClassGroupTextFromUID = getClassGroupTextFromUID;
  getAverage = getAverage;
}
