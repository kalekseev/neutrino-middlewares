import { validate } from 'webpack';
import { Neutrino } from 'neutrino';

// eslint-disable-next-line global-require, import/no-unresolved
const mw = () => require('.');

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
