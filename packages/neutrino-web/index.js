const htmlLoader = require('@neutrinojs/html-loader');
const styleLoader = require('@kotify/neutrino-style-loader');
const fontLoader = require('@neutrinojs/font-loader');
const imageLoader = require('@neutrinojs/image-loader');
const env = require('@neutrinojs/env');
const hot = require('@neutrinojs/hot');
const htmlTemplate = require('@neutrinojs/html-template');
const chunk = require('@neutrinojs/chunk');
const copy = require('@neutrinojs/copy');
const clean = require('@neutrinojs/clean');
const loaderMerge = require('@neutrinojs/loader-merge');
const devServer = require('@neutrinojs/dev-server');
const { join, basename } = require('path');
const { resolve } = require('url');
const merge = require('deepmerge');
const ManifestPlugin = require('webpack-manifest-plugin');
const { optimize } = require('webpack');

const MODULES = join(__dirname, 'node_modules');

module.exports = (neutrino, opts = {}) => {
  const publicPath = opts.publicPath || '/';
  const options = merge({
    publicPath,
    env: [],
    hot: true,
    hotEntries: [],
    html: {},
    devServer: {
      hot: opts.hot !== false,
      publicPath: resolve('/', publicPath)
    },
    style: {
      hot: opts.hot !== false,
      extract: process.env.NODE_ENV === 'production'
    },
    manifest: opts.html === false ? {} : false,
    clean: opts.clean !== false && {
      paths: [neutrino.options.output]
    },
    targets: {},
    font: {},
    image: {}
  }, opts);

  if (typeof options.devServer.proxy === 'string') {
    options.devServer.proxy = {
      '**': {
        target: options.devServer.proxy,
        changeOrigin: true,
        headers: {
          'X-Dev-Server-Proxy': options.devServer.proxy
        }
      }
    };
  }

  Object.assign(options, {
    style: options.style && merge(options.style, {
      extract: options.style.extract === true ? {} : options.style.extract
    })
  })

  const staticDir = join(neutrino.options.source, 'static');

  neutrino.use(env, options.env);
  neutrino.use(htmlLoader);

  Object
    .keys(neutrino.options.mains)
    .forEach(key => {
      neutrino.config
        .entry(key)
          .add(neutrino.options.mains[key])
          .when(options.html, () => {
            neutrino.use(htmlTemplate, merge({
              pluginId: `html-${key}`,
              filename: `${key}.html`,
              // When using the chunk middleware, the names in use by default there
              // need to be kept in sync with the additional values used here
              chunks: [key, 'vendor', 'runtime']
            }, options.html));
          });
    });

  neutrino.config
    .when(options.style, () => neutrino.use(styleLoader, options.style))
    .when(options.font, () => neutrino.use(fontLoader, options.font))
    .when(options.image, () => neutrino.use(imageLoader, options.image))
    .target('web')
    .context(neutrino.options.root)
    .output
      .publicPath(options.publicPath)
      .filename('[name].js')
      .chunkFilename('[name].[chunkhash].js')
      .pathinfo(true)
      .devtoolModuleFilenameTemplate(info => join(__dirname, info.absoluteResourcePath).replace(/\\/g, '/'))
      .end()
    .resolve
      .modules
        .add('node_modules')
        .add(neutrino.options.node_modules)
        .add(MODULES)
        .when(__dirname.includes('neutrino-dev'), modules => {
          // Add monorepo node_modules to webpack module resolution
          modules.add(join(__dirname, '../../node_modules'));
        })
        .end()
      .extensions
        .merge(neutrino.options.extensions.concat('json').map(ext => `.${ext}`))
        .end()
      .end()
    .resolveLoader
      .modules
        .add(neutrino.options.node_modules)
        .add(MODULES)
        .when(__dirname.includes('neutrino-dev'), modules => {
          // Add monorepo node_modules to webpack module resolution
          modules.add(join(__dirname, '../../node_modules'));
        })
        .end()
      .end()
    .node
      .set('Buffer', false)
      .set('fs', 'empty')
      .set('tls', 'empty')
      .end()
    .module
      .rule('worker')
        .test(neutrino.regexFromExtensions(neutrino.options.extensions.map(ext => `worker.${ext}`)))
        .use('worker')
          .loader(require.resolve('worker-loader'))
          .end()
        .end()
      .end()
    .when(neutrino.config.module.rules.has('lint'), () => {
      neutrino.use(loaderMerge('lint', 'eslint'), {
        envs: ['browser', 'commonjs']
      });
    })
    .when(process.env.NODE_ENV === 'development', config => config.devtool('cheap-module-source-map'))
    .when(neutrino.options.command === 'start', (config) => {
      neutrino.use(devServer, options.devServer);
      config.when(options.hot, () => {
        neutrino.use(hot);
        config.when(options.hotEntries, (config) => {
          const protocol = config.devServer.get('https') ? 'https' : 'http';
          const url = `${protocol}://${config.devServer.get('public')}`;

          Object
            .keys(neutrino.options.mains)
            .forEach(key => {
              config
                .entry(key)
                  .batch(entry => {
                    options.hotEntries.forEach(hotEntry => entry.prepend(hotEntry));
                    entry
                      .prepend(require.resolve('webpack/hot/dev-server'))
                      .prepend(`${require.resolve('webpack-dev-server/client')}?${url}`);
                  });
            });
        });
      });
    })
    .when(process.env.NODE_ENV === 'production', (config) => {
      neutrino.use(chunk);

      config
        .plugin('module-concat')
          .use(optimize.ModuleConcatenationPlugin)
          .end()
        .devtool('source-map')
        .bail(true);
    })
    .when(neutrino.options.command === 'build', (config) => {
      config.when(options.clean, () => neutrino.use(clean, options.clean))
      .output.path(neutrino.options.output);
      neutrino.use(copy, {
        patterns: [{
          context: staticDir,
          from: '**/*',
          to: basename(staticDir)
        }]
      });

      if (options.manifest) {
        neutrino.config.plugin('manifest')
          .use(ManifestPlugin, [options.manifest]);
      }

      config.output.filename('[name].[chunkhash:8].js');
    });
};
