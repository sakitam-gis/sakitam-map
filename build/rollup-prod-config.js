const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const uglify = require('uglify-js');
const rollup = require('rollup');
const configs = require('./rollup-base-config');

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

/**
 * build
 * @param builds
 */
function build (builds) {
  let index = 0;
  const total = builds.length;
  const next = () => {
    const _result = buildEntry(builds[index]).next();
    _result.value.then(() => {
      index++;
      if (index < total) {
        next();
      }
    }).catch(logError);
  };
  next();
}
/**
 * builder
 * @param input
 * @param output
 * @returns {Promise.<TResult>}
 */
const buildEntry = function* ({ input, output }) {
  const isProd = /min\.js$/.test(output.file);
  yield rollup.rollup(input)
    .then(bundle => bundle.generate(output))
    .then(({ code }) => {
      if (isProd) {
        const minified = uglify.minify(code, {
          output: {
            preamble: output.banner,
            /* eslint-disable camelcase */
            ascii_only: true
            /* eslint-enable camelcase */
          }
        }).code;
        return write(output.file, minified, true)
      } else {
        return write(output.file, code)
      }
    })
}
/**
 * write file to disk
 * @param dest
 * @param code
 * @param zip
 * @returns {Promise}
 */
const write = (dest, code, zip) => {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blueString(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''));
      resolve()
    }
    fs.writeFile(dest, code, err => {
      if (err) return reject(err);
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err);
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
};

/**
 * get file size
 * @param code
 * @returns {string}
 */
function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

/**
 * print error
 * @param e
 */
function logError (e) {
  console.log(e)
}

/**
 * add message color
 * @param str
 * @returns {string}
 */
function blueString (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

build(Object.keys(configs).map(key => configs[key]))
