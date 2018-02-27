const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const autoprefixer = require("autoprefixer");
const base = require("@kotify/neutrino-react-typescript");
const merge = require("deepmerge");

const appOptions = {
  web: {
    style: {
      cssLoader: "typings-for-css-modules-loader",
      css: {},
      loaders: [
        {
          loader: require.resolve("postcss-loader"),
          options: {
            ident: "postcss",
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
                sourceMap: true,
                namedExport: true,
                localIdentName: "[path]__[name]___[local]",
                camelCase: true,
                silent: true
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
  }
};
