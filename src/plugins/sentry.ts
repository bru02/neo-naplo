import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';

if (
  process.env.NODE_ENV === 'production' &&
  process.env.VUE_APP_SENTRY_LARAVEL_DSN
) {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_LARAVEL_DSN,
    integrations: [
      // @ts-ignore
      new VueIntegration({
        Vue,
        attachProps: true,
      }),
    ],
    release: 'filc@' + process.env.VUE_APP_SHA,
  });
}
