/**
 * Created by FDD on 2017/11/6.
 * @desc 测试
 */

const base = require('./karma.base.config.js')
module.exports = function (config) {
  config.set(Object.assign(base, {
    browsers: ['Chrome'],
    reporters: ['mocha'],
    singleRun: true
  }))
}
