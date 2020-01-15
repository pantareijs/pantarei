'use strict'

import { Directive } from './directive.js'
import { Expression } from '../expression.js'

export class DirectiveEvent extends Directive {

  static get type () { return 'event' }

  static get _prefix () { return 'ev.' }

  static match (attribute) {
    return attribute.name.startsWith(this._prefix)
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let event_name = attribute.name.substring(this._prefix.length)
    let handler_path = attribute.value

    let directive = new this({ node, event_name, handler_path })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.event_name = options.event_name

    if (this.node._listeners && this.node._listeners[this.event_name]) {
      return
    }

    this.handler_path = options.handler_path
    this.expression = new Expression(this.handler_path)

    this._on_event = this._on_event.bind(this)

    let unbubbled = ['focus', 'blur']
    if (this.node.nodeName === 'INPUT' && unbubbled.includes(this.event_name)) {
      let postfix = '-bubble'
      let custom_event_name = this.event_name + postfix
      this.node.addEventListener(this.event_name, (event) => {
        let config = { bubbles: true, cancelable: true, detail: event }
        let custom_event = new CustomEvent(custom_event_name, config)
        this.node.dispatchEvent(custom_event)
      })
      this.event_name = custom_event_name
    }

    let root = this.node
    while (!root.host) {
      root = root.parentNode
    }
    root = root.getRootNode()
    let host = root.host
    this._host = host

    host._listening = host._listening || {}
    if (!host._listening[this.event_name]) {
      host.shadowRoot.addEventListener(this.event_name, this._on_event, false)
      host._listening[this.event_name] = true
    }

    let event_listener = this.expression.eval(host)
    this.node._listeners = this.node._listeners || {}
    this.node._listeners[this.event_name] = event_listener
    event_listener.host = host
  }

  run (data, context) {
    return
  }

  _on_event (event) {
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
