import { Neutrino } from 'neutrino';

// eslint-disable-next-line global-require, import/no-unresolved
const mw = () => require('.');
const options = { css: { modules: true }, style: { sourceMap: true } };

test('loads middleware', () => {
  mw();
});

test('uses middleware', () => {
  Neutrino().use(mw());
});

test('uses with options', () => {
  Neutrino().use(mw(), options);
});

test('instantiates', () => {
  const api = Neutrino();
  api.use(mw());
  const config = api.config.toConfig();
  expect(config).toMatchSnapshot();
});

test('instantiates with options', () => {
  const api = Neutrino();
  api.use(mw(), options);
  const config = api.config.toConfig();
  expect(config).toMatchSnapshot();
});
