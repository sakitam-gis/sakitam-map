/**
 * Created by FDD on 2017/11/6.
 * @desc 测试驱动开发
 */

const base = {
  frameworks: ['mocha', 'expect', 'sinon', 'happen'],
  basePath: '..',
  files: [
    'dist/sakitam-map.js',
    'test/**/*.js'
  ],
  proxies: {
  },
  preprocessors: {
    'test/index.js': ['babel']
  },
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
}

module.exports = function (config) {
  config.set(Object.assign(base, {
    browsers: ['Chrome'],
    reporters: ['mocha']
  }))
}
