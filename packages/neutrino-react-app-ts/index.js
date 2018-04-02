const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
// eslint-disable-next-line
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const base = require("@kotify/neutrino-react-typescript");
const merge = require("deepmerge");

const appOptions = {
  web: {
    style: {
      cssLoader: "typings-for-css-modules-loader",
      css: {
        sourceMap: true,
        namedExport: true,
        camelCase: true,
        silent: true
      },
      loaders: [
        {
          loader: require.resolve("postcss-loader"),
          options: {
            ident: "postcss",
            sourceMap: true,
            plugins: () => [
              // eslint-disable-next-line global-require
              require("postcss-flexbugs-fixes"),
              autoprefixer({
                flexbox: "no-2009"
              })
            ]
          }
        },
        {
          loader: require.resolve("sass-loader"),
          options: {
            sourceMap: true
          }
        }
      ]
    }
  }
};

module.exports = (neutrino, opts = {}) => {
  if (neutrino.options.command === "build") {
    neutrino.use(
      base,
      merge.all([
        {
          web: {
            style: {
              css: {
                minimize: true,
                localIdentName: "[path]__[name]___[local]"
              }
            }
          }
        },
        appOptions,
        opts
      ])
    );
  } else {
    const options = merge(appOptions, opts);
    neutrino.use(base, options);
  }

  // Moment.js is an extremely popular library that bundles large locale files
  // by default due to how Webpack interprets its code. TODO: Revisit in future.
  // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
  neutrino.config.plugin('ignore').use(webpack.IgnorePlugin, [
    /^\.\/locale$/, /moment$/
  ])

  if (neutrino.options.command === "build") {
    neutrino.config.plugin("uglifyjs").use(UglifyJsPlugin, [
      {
        uglifyOptions: {
          ecma: 8,
          compress: {
            warnings: false,
            comparisons: false
          },
          mangle: {
            safari10: true
          },
          output: {
            comments: false,
            ascii_only: true
          }
        },
        parallel: true,
        cache: true,
        sourceMap: true
      }
    ]);
  } else {
    neutrino.config.plugin('watchIgnore').use(webpack.WatchIgnorePlugin, [[
      /css\.d\.ts$/
    ]]);
  }
};
