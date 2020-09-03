const BundleAnalyzerPlugin = require('@bundle-analyzer/webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

process.env.VUE_APP_SHA = process.env.SOURCE_VERSION;

module.exports = {
  transpileDependencies: ['vuetify'],
  outputDir: 'public',
  devServer: {
    proxy: 'http://127.0.0.1:8000'
  },
  indexPath:
    process.env.NODE_ENV === 'production'
      ? '../resources/views/index.blade.php'
      : 'index.html',
  chainWebpack: config => {
    config.plugin('VuetifyLoaderPlugin').tap(() => [
      {
        progressiveImages: true
      }
    ]);
    config.plugin('bundle-analyzer').use(BundleAnalyzerPlugin, [
      {
        token: process.env.BUNDLE_ANALYZER_PLUGIN
      }
    ]);
    config.plugin('workbox').use(InjectManifest, [
      {
        swSrc: './src/sw.js'
      }
    ]);
  },
  pwa: {
    themeColor: '#303f9f',
    name: 'Neo Napló',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/sw.js'
    },
    manifestOptions: {
      background_color: '#ffffff'
    }
  }
};
