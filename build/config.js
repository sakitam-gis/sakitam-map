/**
 * Created by FDD on 2017/11/6.
 * @desc rollup 配置
 */

const path = require('path')
const buble = require('rollup-plugin-buble')
const replace = require('rollup-plugin-replace')
const package_ = require('../package.json')
const version = process.env.VERSION || package_.version
const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')

const resolvePath = _path => path.resolve(__dirname, '../', _path)

const configs = {
  umdDev: {
    input: resolvePath('src/index.js'),
    file: resolvePath(package_.unpkg),
    format: 'umd',
    env: 'development'
  },
  umdProd: {
    input: resolvePath('src/index.js'),
    file: resolvePath('dist/sakitam-map.min.js'),
    format: 'umd',
    env: 'production'
  },
  commonjs: {
    input: resolvePath('src/index.js'),
    file: resolvePath('dist/sakitam-map.common.js'),
    format: 'cjs'
  },
  esm: {
    input: resolvePath('src/index.js'),
    file: resolvePath(package_.module),
    format: 'es'
  }
}

function genConfig (opts) {
  const config = {
    input: {
      input: opts.input,
      plugins: [
        resolve(),
        babel({
          exclude: 'node_modules/**'
        })
      ]
    },
    output: {
      file: opts.file,
      format: opts.format,
      name: 'SMap'
    }
  }

  if (opts.env) {
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  return config
}

function mapValues (obj, fn) {
  const res = {}
  Object.keys(obj).forEach(key => {
    res[key] = fn(obj[key], key)
  })
  return res
}

module.exports = mapValues(configs, genConfig)
