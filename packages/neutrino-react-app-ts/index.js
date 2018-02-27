const base = require('@kotify/neutrino-react-typescript');
const merge = require('deepmerge');

const appOptions =  {
  web: {
    style: {
      cssLoader: 'typings-for-css-modules-loader',
      css: {
        namedExport: true,
        camelCase: true,
        sourceMap: true,
        silent: true,
        localIdentName: '[path]__[name]___[local]'
      },
      loaders: [
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }
      ]
    }
  }
}

module.exports = (neutrino, opts = {}) => {
  const options = merge(appOptions, opts);
  neutrino.use(base, options);
};
