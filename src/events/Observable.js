import { trim } from '../utils';

class Observable {
  /**
   * Register a handler function to be called whenever this event is dispatch.
   * @param events
   * @param callback
   * @param context
   * @returns {Observable}
   */
  on (events, callback, context) {
    if (!events || !callback) { // when no event listeners or callback, return this
      return this
    }
    if (typeof events === 'object') {
      for (const type in events) {
        this._on(type, events[type], callback)
      }
    } else {
      // events can be a string of space-separated words
      const _events = trim(events).split(/\s+/)
      for (let i = 0, len = _events.length; i < len; i++) {
        this._on(_events[i], callback, context)
      }
    }
    return this
  }

  /**
   * Removes a previously added listener function. If no function is specified, it will remove all the listeners
   * @param events
   * @param callback
   * @param context
   * @returns {Observable}
   */
  un (events, callback, context) {
    if (!events) {
      // clear all listeners if called without arguments
      delete this._events
    } else if (typeof events === 'object') {
      for (const type in events) {
        this._un(type, events[type], callback)
      }
    } else {
      const _events = trim(events).split(/\s+/)
      for (let i = 0, len = _events.length; i < len; i++) {
        this._un(_events[i], callback, context)
      }
    }
    return this
  }

  /**
   * Alias for [on]{@link Observable.on}
   * @returns {*}
   */
  addEventListener () {
    return this.on.apply(this, arguments);
  }

  /**
   * Alias for [off]{@link Observable.un}
   * @returns {*}
   */
  removeEventListener () {
    return this.un.apply(this, arguments);
  }

  /**
   * Same as on, except the listener will only get dispatch once and then removed.
   * @param events
   * @param callback
   * @param context
   * @returns {Observable}
   */
  once (events, callback, context) {
    if (!events || !callback) { // when no event listeners or callback, return this
      return this;
    }
    if (typeof events === 'object') {
      for (const type in events) {
        this.once(type, events[type], callback)
      }
      return this;
    }
    let handler = () => {
      this.un(events, callback, context).un(events, handler, context)
    };
    // add a listener that's executed once and removed after that
    return this.on(events, callback, context).on(events, handler, context);
  }

  /**
   * Register internal
   * @param event
   * @param callback
   * @param context
   * @private
   */
  _on (event, callback, context) {
    this._events = this._events || {};
    let _listeners = this._events[event];
    if (!_listeners) {
      _listeners = [];
      this._events[event] = _listeners
    }
    if (context === this) {
      // Less memory footprint.
      context = undefined
    }
    let newListener = {
      handler: callback,
      context: context
    };
    let listeners = _listeners;
    // check if handler already there
    for (let i = 0, len = listeners.length; i < len; i++) {
      if (listeners[i].handler === callback && listeners[i].context === context) {
        return this;
      }
    }
    listeners.push(newListener);
  }

  /**
   * un internal
   * @param event
   * @param callback
   * @param context
   * @private
   */
  _un (event, callback, context) {
    let [listeners, i, len] = [];
    if (!this._events) { return }
    listeners = this._events[event];
    if (!listeners) {
      return
    }
    if (!callback) {
      // Set all removed listeners to noop so they are not called if remove happens in fire
      for (i = 0, len = listeners.length; i < len; i++) {
        listeners[i].callback = function () { return false }
      }
      // clear all listeners for a type if function isn't specified
      delete this._events[event];
      return
    }
    if (context === this) {
      context = undefined
    }
    if (listeners) {
      // find handler and remove it
      for (i = 0, len = listeners.length; i < len; i++) {
        let $listener = listeners[i];
        if ($listener.context !== context) { continue }
        if ($listener.handler === callback) {
          // set the removed listener to noop so that's not called if remove happens in fire
          $listener.handler = function () { return false };
          if (this._firingCount) {
            /* copy array in case events are being fired */
            this._events[event] = listeners = listeners.slice()
          }
          listeners.splice(i, 1);
          return
        }
      }
    }
  }

  /**
   * dispatch
   * @returns {*}
   */
  dispatch () {
    return this._action.apply(this, arguments);
  }

  /**
   * dispatchSync
   * @returns {Observable}
   */
  dispatchSync () {
    setTimeout(() => {
      this._action.apply(this, arguments)
    });
    return this
  }

  /**
   * action internal
   * @param type
   * @param data
   * @returns {Observable}
   * @private
   */
  _action (type, data) {
    if (!this.listens(type)) { return this }
    let event = {
      type: type,
      target: this
    };
    if (this._events) {
      let listeners = this._events[type];
      if (listeners) {
        this._firingCount = (this._firingCount + 1) || 1;
        for (let i = 0, len = listeners.length; i < len; i++) {
          let $listener = listeners[i];
          $listener.handler.call($listener.context || this, event, data);
        }
        this._firingCount--
      }
    }
    return this;
  }

  /**
   * Returns `true` if a particular event type has any listeners attached to it.
   * @param type
   * @returns {boolean}
   */
  listens (type) {
    let listeners = this._events && this._events[type];
    if (listeners && listeners.length) { return true }
    return false;
  }
}

export default Observable
