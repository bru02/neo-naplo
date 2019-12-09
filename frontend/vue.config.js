// const VuetifyLoaderPlugin = require("vuetify-loader/lib/plugin");
// const WebpackDeepScopeAnalysisPlugin = require("webpack-deep-scope-plugin")
//   .default;
// const PurgecssPlugin = require("purgecss-webpack-plugin");
// const glob = require("glob-all");
const WebpackDeepScopeAnalysisPlugin = require('webpack-deep-scope-plugin')
  .default;

module.exports = {
  transpileDependencies: ['vuetify'],
  outputDir: '../public',
  devServer: {
    proxy: 'http://127.0.0.1:8000'
  },
  indexPath:
    process.env.NODE_ENV === 'production'
      ? '../resources/views/index.blade.php'
      : 'index.html',
  // configureWebpack: {
  //   plugins: [
  //     new VuetifyLoaderPlugin({
  //       match(originalTag, { camelTag }) {
  //         components = new Map(
  //           glob.sync(["./**/*.vue"]).map(c => {
  //             return [
  //               c
  //                 .split("/")
  //                 .pop()
  //                 .replace(".vue", ""),
  //               c.replace("src/", "")
  //             ];
  //           })
  //         );
  //         if (components.has(camelTag)) {
  //           return [
  //             originalTag,
  //             `import ${camelTag} from '@/${components.get(camelTag)}'`
  //           ];
  //         }
  //       }
  //     }),
  //     new WebpackDeepScopeAnalysisPlugin()
  //   ],
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.plugin('dsa').use(WebpackDeepScopeAnalysisPlugin);
    }
    config.plugin('VuetifyLoaderPlugin').tap(args => [
      {
        progressiveImages: process.env.NODE_ENV === 'production'
      }
    ]);
  }
};
