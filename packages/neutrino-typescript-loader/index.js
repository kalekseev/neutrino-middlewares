const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = (neutrino, options = {}) => neutrino.config
  .module
  .rules
    .delete('compile')
  .end()
  .rule('compile')
    .test(options.test || /\.tsx?$/)
    .when(options.include, rule => rule.include.merge(options.include))
    .when(options.exclude, rule => rule.exclude.merge(options.exclude))
    .use(options.useId || 'typescript')
      .loader(require.resolve('awesome-typescript-loader'))
      .options(options.compile)
      .end()
    .end()
  .rule('lint')
    .test(options.test || /\.tsx?$/)
    .when(options.include, rule => rule.include.merge(options.include))
    .when(options.exclude, rule => rule.exclude.merge(options.exclude))
    .pre()
    .use(options.useId || 'tslint')
      .loader(require.resolve('tslint-loader'))
      .options(options.lint)
      .end()
    .end()
  .rule('jsmap')
    .test(/\.js$/)
    .when(
      options.sourceMapLoader && options.sourceMapLoader.include,
      rule => rule.include.merge(options.sourceMapLoader.include)
    )
    .when(
      options.sourceMapLoader && options.sourceMapLoader.exclude,
      rule => rule.exclude.merge(options.sourceMapLoader.exclude)
    )
    .pre()
    .use('jsmapLoader')
      .loader(require.resolve('source-map-loader'))
      .end()
    .end()
  .end()
  .when(neutrino.options.command === 'start', () => {
    neutrino.config.plugin('checker').use(CheckerPlugin);
  });
