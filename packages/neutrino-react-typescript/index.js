const web = require('@kotify/web');
const typescriptLoader = require('@kotify/neutrino-typescript-loader');
const { join } = require('path');
const merge = require('deepmerge');

const MODULES = join(__dirname, 'node_modules');

module.exports = (neutrino, opts = {}) => {
  const options = merge({
    hot: true,
    hotEntries: [require.resolve('react-hot-loader/patch')],
    devServer: { overlay: true }
  }, opts.web || {});

  neutrino.use(web, options);
  neutrino.use(typescriptLoader, opts.typescript || {});

  neutrino.config
    .resolve
      .batch((resolve) => {
        if (opts.node_modules) {
          opts.node_modules.forEach(p => { resolve.modules.add(p) });
        }
        resolve.modules.add(MODULES);
        resolve.alias.set('react-native', 'react-native-web');
      })
      .end()
    .resolveLoader
      .modules
        .add(MODULES);
};
