import {
  isBrowser, trim, uuid, isDate,
  isObject, encode, forEach, isFormData,
  isURLSearchParams, isNull
} from './common'

/**
 * default config
 * @type {{method: string, baseURL: string, headers: {"Content-type": string}, timeout: number, withCredentials: boolean}}
 */
const defaults = {
  method: 'get',
  baseURL: '',
  headers: {
    'Content-type': 'application/x-www-form-urlencoded'
  },
  timeout: 0,
  withCredentials: false,
  paramsSerializer: '',
  onDownloadProgress: function () {},
  onUploadProgress: function () {}
};

const ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * error handle
 * @param message
 * @param config
 * @param code
 * @param request
 * @param response
 * @returns {Error}
 */
const createError = (message, config, code, request, response) => {
  const error = new Error(message);
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

/**
 * parse header to xhr
 * @param headers
 * @returns {null}
 */
const parseHeaders = (headers) => {
  let [parsed, key, val, i] = [{}, undefined, undefined, undefined];
  if (!headers) { return parsed; }
  forEach(headers.split('\n'), (line) => {
    i = line.indexOf(':');
    key = trim(line.substr(0, i)).toLowerCase();
    val = trim(line.substr(i + 1));
    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });
  return parsed;
};

/**
 * build service url
 * @param url
 * @param params
 * @param paramsSerializer
 * @returns {*}
 */
const buildURL = (url, params, paramsSerializer) => {
  /* eslint no-param-reassign: 0 */
  if (!params) {
    return url;
  }
  let serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    const parts = [];
    forEach(params, (val, key) => {
      if (val === null || typeof val === 'undefined') {
        return;
      }
      if (Array.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }
      forEach(val, (v) => {
        if (isDate(v)) {
          v = v.toISOString();
        } else if (isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });
    serializedParams = parts.join('&');
  }
  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }
  return url;
};

/**
 * combine service url
 * @param config
 * @returns {*}
 */
const combineURL = (config) => {
  let url = trim(config.url);
  let baseUrl = trim(config.baseURL || '');
  if (!url && isBrowser && !baseUrl) url = location.href;
  if (url.indexOf('http') !== 0) {
    /* eslint no-useless-escape: "off" */
    let isAbsolute = /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    if (!baseUrl && isBrowser) {
      const arr = location.pathname.split('/');
      arr.pop();
      baseUrl = location.protocol + '//' + location.host + (isAbsolute ? baseUrl : arr.join('/'));
    }
    url = baseUrl.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
    if (isBrowser) {
      const a = document.createElement('a');
      a.href = url;
      url = a.href;
    }
  }
  return url
};

class Ajax {
  static createInstance = (adapter) => {
    return new Ajax(adapter);
  };
  constructor (adapter) {
    this.adapter = adapter || XMLHttpRequest;
  }
  request (config) {
    if (typeof config === 'string') {
      config = Object.assign({
        url: arguments[0]
      }, arguments[1]);
    }
    config = Object.assign({}, defaults, config);
    config.method = config.method.toLowerCase();
    /* eslint new-cap: 0 */
    let request = new this.adapter();
    let promise = new Promise((resolve, reject) => {
      let requestData = config.data;
      let requestHeaders = config.headers;
      request.withCredentials = !!config.withCredentials;
      const isGet = config.method === 'get';
      if (isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }
      const url = combineURL(config);
      request.open(config.method.toUpperCase(), buildURL(url, config.params, config.paramsSerializer), true);
      request.timeout = config.timeout
      request.onload = () => {
        if (!request || (request.readyState !== 4)) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        const responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null
        const responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
        resolve({
          data: responseData,
          status: request.status === 1223 ? 204 : request.status,
          statusText: request.status === 1223 ? 'No Content' : request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        });
        request = null;
      };
      request.onabort = () => {
        if (!request) {
          return;
        }
        reject(createError('Request aborted', config, 'ECONNABORTED', request));
        request = null;
      };
      request.onerror = (e) => {
        reject(createError('Network Error', config, null, request));
        request = null;
      };
      request.ontimeout = () => {
        reject(createError(`timeout of ' ${config.timeout} 'ms exceeded`, config, 'ECONNABORTED', request));
        // Clean up request
        request = null;
      };
      if ('setRequestHeader' in request) {
        forEach(requestHeaders, (val, key) => {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }
      if (config.responseType) {
        try {
          request.responseType = config.responseType;
        } catch (e) {
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      }
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }
      request.send(isGet ? null : requestData);
    });
    promise.request = request;
    return promise
  }
  get (url, config = {}) {
    return this.request(Object.assign({}, config, {
      method: 'get',
      url: url
    }))
  }
  getJSON (url, config = {}) {
    return this.request(Object.assign({}, config, {
      method: 'get',
      url: url,
      responseType: 'json'
    }))
  }
  jsonp (url, options = {}) {
    return new Promise((resolve, reject) => {
      const prefix = options.prefix || '_jsonp_';
      const id = options.name || (prefix + uuid().replace(/-/g, '_'));
      const param = options.param || 'callback';
      const timeout = !isNull(options.timeout) ? options.timeout : 60000;
      const target = document.getElementsByTagName('script')[0] || document.head;
      let [script, timer] = [];
      if (timeout) {
        timer = setTimeout(() => {
          cleanup();
          reject(createError(`timeout of ' ${timeout} 'ms exceeded`, options, 'ECONNABORTED', this));
        }, timeout);
      }

      function cleanup () {
        if (script.parentNode) script.parentNode.removeChild(script);
        window[id] = function () {};
        if (timer) clearTimeout(timer);
      }

      window[id] = function (data) {
        cleanup();
        resolve(data);
      };
      url += (~url.indexOf('?') ? '&' : '?') + param + '=' + encodeURIComponent(id);
      url = url.replace('?&', '?');
      script = document.createElement('script');
      script.src = url;
      target.parentNode.insertBefore(script, target);
    })
  }
  getImage (img, url, config = {}) {
    config.responseType = 'arraybuffer';
    return this.get(url, config).then((imgData) => {
      if (imgData) {
        const URL = window.URL || window.webkitURL;
        const onload = img.onload;
        img.onload = () => {
          if (onload) {
            onload();
          }
          URL.revokeObjectURL(img.src);
        };
        const blob = new Blob([new Uint8Array(imgData.data)], { type: imgData.contentType });
        img.cacheControl = imgData.cacheControl;
        img.expires = imgData.expires;
        img.src = imgData.data.byteLength ? URL.createObjectURL(blob) : '';
      }
    }).catch(error => {
      if (img.onerror) {
        img.onerror(error);
      }
    })
  }
  post (url, data, config = {}) {
    return this.request(Object.assign({}, config, {
      method: 'post',
      url: url,
      data: data
    }))
  }

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   * @param callback
   * @returns {Function}
   */
  spread (callback) {
    return function (arr) {
      return callback.apply(null, arr)
    }
  }
}

const ajax = Ajax.createInstance();
ajax.create = function (adapter) {
  return Ajax.createInstance(adapter);
};
export default ajax
