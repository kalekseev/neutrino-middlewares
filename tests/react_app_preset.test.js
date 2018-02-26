import { validate } from 'webpack';
import { Neutrino } from 'neutrino';

test('loads preset', () => {
  require('../packages/neutrino-react-app-ts')
});

test('uses preset', () => {
  Neutrino().use(require('../packages/neutrino-react-app-ts'));
});

test('valid preset production', () => {
  const api = Neutrino({ env: { NODE_ENV: 'production' } });
  api.use(require('../packages/neutrino-react-app-ts'));
  const errors = validate(api.config.toConfig());
  expect(errors.length).toBe(0);
});

test('valid preset development', () => {
  const api = Neutrino({ 'env': { NODE_ENV: 'development' } });
  api.use(require('../packages/neutrino-react-app-ts'));
  const errors = validate(api.config.toConfig());
  expect(errors.length).toBe(0);
  // inspect(api.config.toConfig(), api)
  //   .fork(
  //     () => err => console.error(err),
  //     config => console.log(config)
  //   );
});
