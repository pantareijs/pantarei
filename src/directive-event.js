import { ExpressionPath } from './expression-path'

export class DirectiveEvent {

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
    let root_node = this.root_node = node.getRootNode()
    let event_name = this.event_name = options.event_name
    let event_expression = this.event_expression = options.event_expression

    this._on_event = this._on_event.bind(this)
    root_node._listening = root_node._listening || {}
    if (!root_node._listening[event_name]) {
      root_node.addEventListener(event_name, this._on_event, false)
      root_node._listening[event_name] = true
    }
  }

  run (node, context) {
    node._listeners = node._listeners || {}
    let event_listener = this.event_expression.evaluate(context)
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
          requestAnimationFrame(() => {
            let context = target.host ? target.host : target
            listener.call(context, event, event.detail)
          })
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