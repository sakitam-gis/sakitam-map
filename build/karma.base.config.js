/**
 * Created by FDD on 2017/11/6.
 * @desc karma 基础配置
 */
const { input, output } = require('./config').umdDev
const config = Object.assign({}, input, { output })
config.name = 'sakitam-map'
config.format = 'umd'

module.exports = {
  frameworks: ['mocha', 'expect', 'sinon', 'happen'],
  basePath: '..',
  files: [
    'src/index.js',
    'test/*.js'
  ],
  proxies: {
  },
  preprocessors: {
    'test/index.js': ['babel'],
    'src/index.js': ['rollup']
  },
  rollupPreprocessor: config,
  customLaunchers: {
    IE10: {
      base: 'IE',
      'x-ua-compatible': 'IE=EmulateIE10'
    },
    IE9: {
      base: 'IE',
      'x-ua-compatible': 'IE=EmulateIE9'
    }
  }
};
