import {merge, formatParams, isFormData, isObject} from '../utils'

class Ajax {
  constructor (engine) {
    this.engine = engine || XMLHttpRequest
    this.interceptors = {
      response: {
        use (handler, onerror) {
          this.handler = handler
          this.onerror = onerror
        }
      },
      request: {
        use (handler) {
          this.handler = handler
        }
      }
    }
    this.config = {
      method: 'GET',
      baseURL: '',
      headers: {},
      timeout: 0,
      withCredentials: false
    }
  }
  request (url, data, options) {
    /* eslint new-cap: 0 */
    const engine = new this.engine()
    let promise = new Promise((resolve, reject) => {
      options = options || {}
      let defaultHeaders = {
        'Content-type': 'application/x-www-form-urlencoded'
      }
      merge(defaultHeaders, this.config.headers)
      this.config.headers = defaultHeaders
      merge(options, this.config)
      let rqi = this.interceptors.request
      let rpi = this.interceptors.response
      options.body = data || options.body
      let abort = false
      let operate = {
        reject: (e) => {
          abort = true
          reject(e)
        },
        resolve: (d) => {
          abort = true
          resolve(d)
        }
      }
      url = url ? url.trim() : ''
      options.method = options.method.toUpperCase()
      options.url = url
      if (rqi.handler) {
        options = rqi.handler(options, operate)
        if (!options) return
      }
      if (abort) return
      url = options.url ? options.url.trim() : ''
      if (!url) url = location.href
      let baseUrl = options.baseURL ? options.baseURL.trim() : ''
      if (url.indexOf('http') !== 0) {
        let isAbsolute = url[0] === '/'
        if (!baseUrl) {
          let arr = location.pathname.split('/')
          arr.pop()
          baseUrl = location.protocol + '//' + location.host + (isAbsolute ? '' : arr.join('/'))
        }
        if (baseUrl[baseUrl.length - 1] !== '/') {
          baseUrl += '/'
        }
        url = baseUrl + (isAbsolute ? url.substr(1) : url)
        let t = document.createElement('a')
        t.href = url
        url = t.href
      }
      let responseType = options.responseType ? options.responseType.trim() : ''
      engine.withCredentials = !!options.withCredentials
      let isGet = options.method === 'GET'
      if (isGet) {
        if (options.body) {
          data = formatParams(options.body)
          url += (url.indexOf('?') === -1 ? '?' : '&') + data
        }
      }
      engine.open(options.method, url)
      // try catch for ie >=9
      try {
        engine.timeout = options.timeout || 0
        if (responseType !== 'stream') {
          engine.responseType = responseType
        }
      } catch (e) {
      }
      if (['object', 'array'].indexOf(Object.prototype.toString.call(options.body).slice(8, -1).toLowerCase()) !== -1) {
        options.headers['Content-type'] = 'application/json;charset=utf-8'
        data = JSON.stringify(options.body)
      }
      for (let k in options.headers) {
        if (k.toLowerCase() === 'content-type' &&
          (isFormData(options.body) || !options.body || isGet)) {
          delete options.headers[k]
        } else {
          try {
            engine.setRequestHeader(k, options.headers[k])
          } catch (e) {
          }
        }
      }
      let onerror = function (e) {
        if (rpi.onerror) {
          e = rpi.onerror(e, operate)
        }
        return e
      }
      engine.onload = () => {
        if ((engine.status >= 200 && engine.status < 300) || engine.status === 304) {
          let response = engine.response || engine.responseText
          if ((engine.getResponseHeader('Content-Type') || '').indexOf('json') !== -1 && !isObject(response)) {
            response = JSON.parse(response)
          }
          let data = {data: response, engine, request: options}
          merge(data, engine._response)
          if (rpi.handler) {
            data = rpi.handler(data, operate) || data
          }
          if (abort) return
          resolve(data)
        } else {
          let err = new Error(engine.statusText)
          err.status = engine.status
          err = onerror(err) || err
          if (abort) return
          reject(err)
        }
      }
      engine.onerror = (e) => {
        let err = new Error(e.msg || 'Network Error')
        err.status = 0
        err = onerror(err)
        if (abort) return
        reject(err)
      }
      engine.ontimeout = () => {
        // Handle timeout error
        let err = new Error(`timeout [ ${engine.timeout}ms ]`)
        err.status = 1
        err = onerror(err)
        if (abort) return
        reject(err)
      }
      engine._options = options
      engine.send(isGet ? null : data)
    })
    promise.engine = engine
    return promise
  }
  get (url, data, options) {
    return this.request(url, data, options)
  }
  getJSON (url, data, options) {
    return this.request(url, data, options)
  }
  getImage (img, url, options) {
    return this.request(img, url, options)
  }
  post (url, data, options) {
    return this.request(url, data, merge({method: 'POST'}, options))
  }
  all (promises) {
    return Promise.all(promises)
  }
  spread (callback) {
    return function (arr) {
      return callback.apply(null, arr)
    }
  }
}

export default Ajax
