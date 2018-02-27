import { inspect } from "neutrino";

const path = require('path');

const printConfig = api =>
  inspect(api.config.toConfig(), api).fork(
    () => err => console.error(err),
    config => console.log(config)
  );

const devtoolModuleFn = pwd => info => path.resolve(pwd, info.absoluteResourcePath).replace(/\\/g, '/')

module.exports = { printConfig, devtoolModuleFn };
