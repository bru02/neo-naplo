import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';

Sentry.init({
  dsn: process.env.VUE_APP_SENTRY_LARAVEL_DSN,
  integrations: [new VueIntegration({ Vue, attachProps: true })]
});
