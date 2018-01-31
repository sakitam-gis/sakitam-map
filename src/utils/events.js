/**
 * bind event
 */
const on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  }
})()

/**
 * unbind event
 */
const off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  }
})()

/**
 * bind event once
 * @param el
 * @param event
 * @param fn
 */
const once = function (el, event, fn) {
  const listener = function () {
    if (fn) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

/**
 * Prevent default behavior of the browser.
 * @param event
 * @returns {preventDefault}
 */
const preventDefault = function (event) {
  if (event.preventDefault) {
    event.preventDefault()
  } else {
    event.returnValue = false
  }
  return this
}

/**
 * Stop browser event propagation
 * @param event
 * @returns {stopPropagation}
 */
const stopPropagation = function (event) {
  if (event.stopPropagation) {
    event.stopPropagation()
  } else {
    event.cancelBubble = true
  }
  return this
}

export {
  on,
  once,
  off,
  preventDefault,
  stopPropagation
}
