'use strict'

import Assert from '../assert/index.js'

export default class Emitter {

  static get events_set () {
    if (!this._events_set) {
      this._events_set = new WeakMap()
    }
    return this._events_set
  }

  static get events_map () {
    if (!this._events_map) {
      this._events_map = new WeakMap()
    }
    return this._events_map
  }

  static get_listeners(instance, event_name) {
    const events = this.events_map.get(instance)
    if (!events.has(event_name)) {
      events.set(event_name, new Set())
    }

    return events.get(event_name)
  }

  get events_set () {
    return this.constructor.events_set.get(this)
  }

  get events_map () {
    return this.constructor.events_map.get(this)
  }

  get_listeners (event_name) {
    return this.constructor.get_listeners(this, event_name)
  }

  constructor () {
    this.events_set.set(new Set())
    this.events_map.set(new Map())
  }

  on (event_name, listener) {
    Assert.string(event_name)
    Assert.function(listener)

    let listeners = this.get_listeners(event_name)
    listeners.add(listener)
    let unsubscribe = this.off.bind(this, event_name, listener)
    return unsubscribe
  }

  off (event_name, listener) {
    Assert.string(event_name)
    Assert.function(listener)

    let listeners = this.get_listeners(event_name)
    listeners.delete(listener)
  }

  once (event_name, listener) {
    Assert.string(event_name)
    Assert.function(listener)

    let wrapped_listener = (data) => {
      listener(data)
      this.off(event_name, wrapped_listener)
    }

    let unsubscribe = this.on(event_name, wrapped_listener)
    return unsubscribe
  }

  async emit (event_name, event_data) {
    Assert.string(event_name)

    const listeners = this.get_listeners(event_name)
    const static_listeners = Array.from(listeners)

    const any_listeners = this.events_set
    const static_any_listeners = Array.from(any_listeners)

    await Promise.resolve()

    let filtered_static_listeners = static_listeners
        .filter(listener => listeners.has(listener))
        .map(listener => listener(event_data))

    let filtered_any_static_listeners = static_any_listeners
        .filter(listener => listeners.has(listener))
        .map(listener => listener(event_name, event_data))

    let all_listeners = filtered_static_listeners.concat(filtered_any_static_listeners)

    await Promise.all(all_listeners)
  }

  async emit_serial (event_name, event_data) {
    Assert.string(event_name)

    const listeners = this.get_listeners(event_name)
    const static_listeners = listeners.slice()
    const any_listeners = this.events_set
    const staticAnyListeners = any_listeners.slice()

    await Promise.resolve()

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
    Assert.function(listener)

    let listeners = this.events_set
    listeners.add(listener)
    let unsubscribe = this.off_any.bind(this, listener)
    return unsubscribe
  }

  off_any (listener) {
    Assert.function(listener)
    let listeners = this.events_set
    listeners.delete(listener)
  }

  clear (event_name) {
    if (typeof event_name === 'string') {
      let listeners = this.get_listeners(event_name)
      listeners.clear()
      return
    }

    let any_listeners = this.events_set
    any_listeners.clear()

    let events_listeners = this.events_map.values()
    for (let event_listeners of events_listeners) {
      event_listeners.clear()
    }
  }

  count (event_name) {
    if (typeof event_name === 'string') {
      let any_listeners = this.events_set
      let any_listeners_count = any_listeners.size
      let event_listeners = this.get_listeners(event_name)
      let event_listeners_count = event_listeners.size
      let count = any_listeners_count + event_listeners_count
      return count
    }

    if (typeof event_name !== 'undefined') {
      Assert.string(event_name)
    }

    let count = this.events_set.size

    for (const value of this.events_map.values()) {
      count += value.size
    }

    return count
  }

}
