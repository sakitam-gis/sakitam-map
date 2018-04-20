/**
 * from https://github.com/iliakan/detect-node
 * @type {boolean}
 */
const isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]' && !process.versions['electron'] && !process.versions['nw'] && !process.versions['node-webkit'];
const isBrowser = typeof document !== 'undefined';

/* eslint no-useless-escape: "off" */
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const byteToHex = [];
const rnds = new Array(16);
for (let i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
};

const camelCase = function (name) {
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  }).replace(MOZ_HACK_REGEXP, 'Moz$1')
};

/**
 * stamp string
 * @param obj
 * @returns {*}
 */
const stamp = function (obj) {
  let key = '_event_id_';
  obj[key] = obj[key] || (uuid());
  return obj[key]
};

/**
 * check is null
 * @param obj
 * @returns {boolean}
 */
const isNull = (obj) => {
  return obj == null;
};

/**
 * check is number
 * @param val
 * @returns {boolean}
 */
const isNumber = (val) => {
  return (typeof val === 'number') && !isNaN(val);
};

/**
 * 判断是否为对象
 * @param value
 * @returns {boolean}
 */
const isObject = value => {
  const type = typeof value
  return value !== null && (type === 'object' || type === 'function')
};

/**
 * check is function
 * @param value
 * @returns {boolean}
 */
const isFunction = value => {
  if (!isObject(value)) {
    return false
  }
  return typeof value === 'function' || (value.constructor !== null && value.constructor === Function);
};

/**
 * is date value
 * @param val
 * @returns {boolean}
 */
const isDate = (val) => {
  return toString.call(val) === '[object Date]';
};

/**
 * is array buffer
 * @param val
 * @returns {boolean}
 */
const isArrayBuffer = (val) => {
  return toString.call(val) === '[object ArrayBuffer]';
};

/**
 * 判断是否为合法字符串
 * @param value
 * @returns {boolean}
 */
const isString = (value) => {
  if (value == null) {
    return false;
  }
  return typeof value === 'string' || (value.constructor !== null && value.constructor === String);
};

/**
 * form uuid
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 * @param buf
 * @param offset
 * @returns {string}
 */
const bytesToUuid = (buf, offset) => {
  let i = offset || 0;
  const bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] +
    bth[buf[i++]] + bth[buf[i++]] + '-' +
    bth[buf[i++]] + bth[buf[i++]] + '-' +
    bth[buf[i++]] + bth[buf[i++]] + '-' +
    bth[buf[i++]] + bth[buf[i++]] + '-' +
    bth[buf[i++]] + bth[buf[i++]] +
    bth[buf[i++]] + bth[buf[i++]] +
    bth[buf[i++]] + bth[buf[i++]];
};

/**
 * math rng
 * @returns {any[]}
 */
const mathRNG = () => {
  for (let i = 0, r; i < 16; i++) {
    if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
    rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
  }
  return rnds;
};

/**
 * get uuid
 * @param options
 * @param buf
 * @param offset
 * @returns {*|string}
 */
const uuid = (options, buf, offset) => {
  /* eslint-disable */
  const i = buf && offset || 0;
  if (typeof (options) === 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};
  const rnds = options.random || (options.rng || mathRNG)();
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  // Copy bytes to buffer, if provided
  if (buf) {
    for (let ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }
  return buf || bytesToUuid(rnds);
};

/**
 * 判断是否为表单数据
 * @param val
 * @returns {boolean}
 */
const isFormData = (val) => {
  return (typeof FormData !== 'undefined') && (val instanceof FormData)
};

/**
 * 编码请求地址
 * @param val
 * @returns {string}
 */
const encode = (val) => {
  return encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
};

/**
 * is search params
 * @param val
 * @returns {boolean}
 */
const isURLSearchParams = (val) => {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
};

/**
 * merge
 * @param a
 * @param b
 * @returns {*}
 */
const merge = (a, b) => {
  for (const key in b) {
    if (isObject(b[key]) && isObject(a[key])) {
      merge(a[key], b[key])
    } else {
      a[key] = b[key]
    }
  }
  return a
};

/**
 * foreach object or array
 * @param obj
 * @param fn
 */
const forEach = (obj, fn) => {
  if (obj === null || typeof obj === 'undefined') {
    return;
  }
  if (typeof obj !== 'object') {
    obj = [obj];
  }
  if (Array.isArray(obj)) {
    for (let i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
};

/**
 * check isEmpty object
 * @param object
 * @returns {boolean}
 */
const isEmpty = (object) => {
  let property;
  for (property in object) {
    return false;
  }
  return !property;
};

/**
 * 检查浏览器版本
 * @returns {*}
 */
const checkBrowser = () => {
  let userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
  if (userAgent.indexOf('OPR') > -1) { // 判断是否Opera浏览器 OPR/43.0.2442.991
    return 'Opera'
  } else if (userAgent.indexOf('Firefox') > -1) { // 判断是否Firefox浏览器  Firefox/51.0
    return 'FF'
  } else if (userAgent.indexOf('Trident') > -1) { // 判断是否IE浏览器  Trident/7.0; rv:11.0
    return 'IE'
  } else if (userAgent.indexOf('Edge') > -1) { // 判断是否Edge浏览器  Edge/14.14393
    return 'Edge'
  } else if (userAgent.indexOf('Chrome') > -1) { // Chrome/56.0.2924.87
    return 'Chrome'
  } else if (userAgent.indexOf('Safari') > -1) { // 判断是否Safari浏览器
    return 'Safari'
  }
};

/**
 * bind
 * @param fn
 * @param context
 * @returns {Function}
 */
const bind = function (fn, context) {
  const args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
  return function() {
    return fn.apply(context, args || arguments);
  };
};

export {
  bind,
  isDate,
  isNode,
  isBrowser,
  stamp,
  uuid,
  merge,
  trim,
  isNull,
  forEach,
  isEmpty,
  isString,
  isObject,
  isNumber,
  camelCase,
  isFunction,
  isFormData,
  checkBrowser,
  encode,
  isArrayBuffer,
  isURLSearchParams
}
