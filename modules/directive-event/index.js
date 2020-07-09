'use strict'

import Directive from '../directive/index.js'

export default class DirectiveEvent extends Directive {

  static prefix = 'ev.'

  constructor (options) {
    super(options)

    let node = this.node
    let event_name = this.key

    if (node._listeners && node._listeners[event_name]) {
      return
    }

    let handle_event = this.handle_event.bind(this)

    let unbubbled_events = { 'focus': 1, 'blur': 1 }
    if (event_name in unbubbled_events) {
      let custom_event_name = event_name + '-bubble'
      node.addEventListener(event_name, (event) => {
        let config = { bubbles: true, cancelable: true, detail: event }
        let custom_event = new CustomEvent(custom_event_name, config)
        node.dispatchEvent(custom_event)
      })
      event_name = custom_event_name
    }

    let root = node
    while (!root.host) {
      root = root.parentNode
    }
    root = root.getRootNode()
    let host = root.host
    this._host = host

    let event_listener = this.value_expression.eval(host)
    if (!event_listener) {
      let listener_name = options.value_path
      console.warn(`${host} has no listener ${listener_name}`)
      return
    }

    event_listener.host = host

    host._listening = host._listening || {}
    if (!host._listening[event_name]) {
      host.shadowRoot.addEventListener(event_name, handle_event, false)
      host._listening[event_name] = true
    }

    node._listeners = node._listeners || {}
    node._listeners[event_name] = event_listener
  }

  handle_event (event) {
    let host = this._host
    let root = host.shadowRoot

    let target = event.target
    let event_type = event.type

    let bubble = true
    let stop = event.stopPropagation

    event.stopPropagation = function () {
      stop.call(event)
      bubble = false
    }

    while (bubble) {
      let listeners = target._listeners
      if (listeners) {
        let listener = listeners[event_type]
        if (listener) {
          host = listener.host
          listener.call(host, event, event.detail)
        }
      }

      if (!bubble) {
        break
      }

      target = target.parentNode
      if (!target) {
        break
      }
      if (target === root) {
        break
      }
    }
  }

}
