'use strict'

export class Emitter {

  static get resolved_promise () {
    return Promise.resolve()
  }

  static get any_map () {
    if (!this._any_map) {
      this._any_map = new WeakMap()
    }
    return this._any_map
  }

  static get events_map () {
    if (!this._events_map) {
      this._events_map = new WeakMap()
    }
    return this._events_map
  }

  static assert_event_name (event_name) {
    if (typeof event_name !== 'string') {
      throw new TypeError('event_name must be a string')
    }
  }

  static assert_listener (listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function')
    }
  }

  static get_listeners(instance, event_name) {
    const events = Emitter.events_map.get(instance)
    if (!events.has(event_name)) {
      events.set(event_name, new Set())
    }

    return events.get(event_name)
  }

  constructor () {
    Emitter.any_map.set(this, new Set())
    Emitter.events_map.set(this, new Map())
  }

  on (event_name, listener) {
    Emitter.assert_event_name(event_name)
    Emitter.assert_listener(listener)

    let listeners = Emitter.get_listeners(this, event_name)
    listeners.add(listener)
    let unsubscribe = this.off.bind(this, event_name, listener)
    return unsubscribe
  }

  off (event_name, listener) {
    Emitter.assert_event_name(event_name)
    Emitter.assert_listener(listener)

    let listeners = Emitter.get_listeners(this, event_name)
    listeners.delete(listener)
  }

  once (event_name, listener) {
    Emitter.assert_event_name(event_name)
    Emitter.assert_listener(listener)

    let wrapped_listener = (data) => {
      listener(data)
      this.off(event_name, wrapped_listener)
    }

    let unsubscribe = this.on(event_name, wrapped_listener)
    return unsubscribe
  }

  async emit (event_name, event_data) {
    Emitter.assert_event_name(event_name)

    const listeners = Emitter.get_listeners(this, event_name)
    const static_listeners = Array.from(listeners)

    const any_listeners = Emitter.any_map.get(this)
    const static_any_listeners = Array.from(any_listeners)

    await Emitter.resolved_promise

    let all_listeners = []

    let filtered_static_listeners = static_listeners
        .filter(listener => listeners.has(listener))
        .map(listener => listener(event_data))

    let filtered_any_static_listeners = static_any_listeners
        .filter(listener => listeners.has(listener))
        .map(listener => listener(event_name, event_data))

    return Promise.all(all_listeners)
  }

  async emit_serial (event_name, eventData) {
    Emitter.assert_event_name(event_name)

    const listeners = Emitter.get_listeners(this, event_name)
    const static_listeners = [...listeners]
    const any_listeners = Emitter.any_map.get(this)
    const staticAnyListeners = [...any_listeners]

    await resolvedPromise

    for (const listener of static_listeners) {
      if (listeners.has(listener)) {
        await listener(event_data)
      }
    }

    for (const listener of static_any_listeners) {
      if (any_listeners.has(listener)) {
        await listener(event_name, event_data)
      }
    }
  }

  on_any (listener) {
    Emitter.assert_listener(listener)

    let listeners = Emitter.any_map.get(this)
    listeners.add(listener)
    let unsubscribe = this.off_any.bind(this, listener)
    return unsubscribe
  }

  off_any (listener) {
    Emitter.assert_listener(listener)
    let listeners = Emitter.any_map.get(this)
    listeners.delete(listener)
  }

  clear (event_name) {
    if (typeof event_name === 'string') {
      let listeners = Emitter.get_listeners(this, event_name)
      listeners.clear()
      return
    }

    let any_listeners = Emitter.any_map.get(this)
    any_listeners.clear()

    let events_listeners = Emitter.events_map.get(this).values()
    for (let event_listeners of events_listeners) {
      event_listeners.clear()
    }
  }

  listener_count (event_name) {
    if (typeof event_name === 'string') {
      return Emitter.any_map.get(this).size + Emitter.get_listeners(this, event_name).size
    }

    if (typeof event_name !== 'undefined') {
      Emitter.assert_event_name(event_name)
    }

    let count = Emitter.any_map.get(this).size

    for (const value of Emitter.events_map.get(this).values()) {
      count += value.size
    }

    return count
  }

}