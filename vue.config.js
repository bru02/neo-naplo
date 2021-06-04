const { InjectManifest } = require('workbox-webpack-plugin');

process.env.VUE_APP_SHA = process.env.SOURCE_VERSION;

module.exports = {
  transpileDependencies: ['vuetify'],
  outputDir: 'public',
  devServer: {
    proxy: 'https://neo-naplo.herokuapp.com',
  },
  indexPath:
    process.env.NODE_ENV === 'production'
      ? '../resources/views/index.blade.php'
      : 'index.html',
  chainWebpack: (config) => {
    config.plugin('VuetifyLoaderPlugin').tap(() => [
      {
        progressiveImages: true,
      },
    ]);
    config.plugin('workbox').use(InjectManifest, [
      {
        swSrc: './src/sw.js',
      },
    ]);
  },
  pwa: {
    themeColor: '#303f9f',
    name: 'Neo Napló',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/sw.js',
    },
    manifestOptions: {
      background_color: '#ffffff',
    },
  },
};
