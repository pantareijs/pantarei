'use strict'

import Assert from '../assert/index.js'
import Type from '../type/index.js'

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

  static get_listeners (instance, event_name) {

  }

  get events_set () {
    return Emitter.events_set.get(this)
  }

  set events_set (set) {
    Emitter.events_set.set(this, set)
  }

  get events_map () {
    return Emitter.events_map.get(this)
  }

  set events_map (map) {
    Emitter.events_map.set(this, map)
  }

  constructor () {
    this.events_set = new Set()
    this.events_map = new Map()
  }

  get_listeners (event_name) {
    let events = this.events_map
    let listeners = events.get(event_name)

    if (!listeners) {
      listeners = new Set()
      events.set(event_name, listeners)
    }

    return listeners
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

  on_any (listener) {
    Assert.function(listener)

    let any_listeners = this.events_set
    any_listeners.add(listener)

    let unsubscribe = this.off_any.bind(this, listener)
    return unsubscribe
  }

  off_any (listener) {
    Assert.function(listener)

    let any_listeners = this.events_set
    any_listeners.delete(listener)
  }

  async emit (event_name, event_data) {
    Assert.string(event_name)

    let listeners = this.get_listeners(event_name)
    let current_listeners = listener.values()

    let any_listeners = this.events_set
    let current_any_listeners = any_listeners.values()

    let promises = []

    await Promise.resolve()

    for (let listener of current_listeners) {
      if (!listeners.has(listener)) {
        continue
      }
      let promise = listener(event_data)
      promises.push(promise)
    }

    for (let listenr of current_any_listeners) {
      if (!any_listeners.has(listener)) {
        continue
      }
      let promise = listener(event_name, event_data)
      promises.push(promise)
    }

    let results = await Promise.allSettled(promises)

    return results
  }

  async emit_serial (event_name, event_data) {
    Assert.string(event_name)

    let listeners = this.get_listeners(event_name)
    let current_listeners = listeners.values()

    let any_listeners = this.events_set
    let current_any_listeners = any_listeners.values()

    await Promise.resolve()

    let promises = []

    for (let listener of current_listeners) {
      if (!listeners.has(listener)) {
        continue
      }
      let promise = listener(event_data)
      promises.push(promise)
    }

    for (let listener of current_any_listeners) {
      if (!any_listeners.has(listener)) {
        continue
      }
      let promise = listener(event_name, event_data)
      promises.push(promise)
    }

    let results = []

    for (let promise of promises) {
      try {
        await promise
      } finally {
        results.push(promise)
      }
    }

    return results
  }

  clear (event_name) {
    if (Type.defined(event_name)) {
      Assert.string(event_name)

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
    if (Type.defined(event_name)) {
      Assert.string(event_name)

      let count = 0

      let any_listeners = this.events_set
      count += any_listeners.size

      let event_listeners = this.get_listeners(event_name)
      count += event_listeners.size

      return count
    }

    let count = 0

    let any_listeners = this.events_set
    count += any_listeners.size

    let events_listeners = this.events_map.values()
    for (let event_listeners of events_listeners) {
      count += event_listeners.size
    }

    return count
  }

}
