const WebpackDeepScopeAnalysisPlugin = require('webpack-deep-scope-plugin')
  .default;

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
    if (process.env.NODE_ENV === 'production') {
      config.plugin('dsa').use(WebpackDeepScopeAnalysisPlugin);
    }
    config.plugin('VuetifyLoaderPlugin').tap(args => [
      {
        progressiveImages: process.env.NODE_ENV === 'production'
      }
    ]);
  },
  pwa: {
    themeColor: '#303f9f',
    name: 'Filc Napló',
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
