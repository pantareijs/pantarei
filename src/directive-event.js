import { ExpressionPath } from './expression-path'

export class DirectiveEvent {

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
    let event_expression = new ExpressionPath(attribute.value)

    let directive = new this({ node, event_name, event_expression })
    return directive
  }

  constructor (options) {
    let node = this.node = options.node
    let root_node = this.root_node = node._root_node
    let event_name = this.event_name = options.event_name
    let event_expression = this.event_expression = options.event_expression

    let unbubbled = ['focus', 'blur']
    if (node.nodeName === 'INPUT' && unbubbled.includes(event_name)) {
      let postfix = '-bubble'
      let custom_event_name = event_name + postfix
      node.addEventListener(event_name, (event) => {
        let config = { bubbles: true, cancelable: true, detail: event }
        let custom_event = new CustomEvent(custom_event_name, config)
        node.dispatchEvent(custom_event)
      })
      event_name = this.event_name = custom_event_name
    }

    this._on_event = this._on_event.bind(this)
    root_node._listening = root_node._listening || {}
    if (!root_node._listening[event_name]) {
      root_node.addEventListener(event_name, this._on_event, false)
      root_node._listening[event_name] = true
    }
  }

  run (node, data, context) {
    node._listeners = node._listeners || {}
    let handler = this.root_node.host ? this.root_node.host : context
    let event_listener = this.event_expression.evaluate(handler)
    node._listeners[this.event_name] = event_listener
  }

  _on_event (event) {
    let root_node = this.root_node

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
          let node = target.host ? target.host : root_node._context
          listener.call(node, event, event.detail)
        }
      }

      if (!bubble) {
        break
      }

      target = target.parentNode
      if (!target) {
        break
      }
      if (target === root_node) {
        break
      }
    }
  }

}