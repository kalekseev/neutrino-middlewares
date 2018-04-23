import { validate } from 'webpack';
import { Neutrino } from 'neutrino';

// eslint-disable-next-line global-require, import/no-unresolved
const mw = () => require('.');
const expectedExtensions = ['.js', '.jsx', '.vue', '.ts', '.tsx', '.mjs', '.json'];

test('loads preset', () => {
  mw();
});

test('uses preset', () => {
  Neutrino().use(mw());
});

test('valid preset production', () => {
  const api = Neutrino({ env: { NODE_ENV: 'production' }, command: 'build' });
  api.use(mw());
  const config = api.config.toConfig();
  // Common
  expect(config.target).toBe('web');
  expect(config.resolve.extensions).toEqual(expectedExtensions);
  expect(config.optimization.runtimeChunk).toBe('single');
  expect(config.optimization.splitChunks.chunks).toBe('all');

  // NODE_ENV/command specific
  expect(config.mode).toBe('production');
  expect(config.optimization.splitChunks.name).toEqual(false);
  expect(config.devtool).toEqual('source-map');
  expect(config.devServer).toEqual(undefined);

  const errors = validate(config);
  expect(errors.length).toBe(0);
  // const { printConfig } = require('@kotify/neutrino-utils');
  // printConfig(api);
  expect(config).toMatchSnapshot()
});

test('valid preset development', () => {
  const api = Neutrino({ env: { NODE_ENV: 'development' }, command: 'start' });
  api.use(mw());
  const config = api.config.toConfig();
  const errors = validate(config);
  expect(errors.length).toBe(0);
  expect(config).toMatchSnapshot()
});
