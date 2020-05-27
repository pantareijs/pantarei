'use strict'

import Directive from '../directive/index.js'

export default class DirectiveProperty extends Directive {

  static prefix = 'prop.'

  constructor (options) {
    super(options)

    let node_name = this.node.nodeName.toLowerCase()
    let prop_name = this.key

    let handler_name = node_name + ' ' + prop_name
    let handler = this[handler_name]
    if (handler) {
      this.run = handler
    }
  }

  run (data) {
    let node = this.node
    let name = this.key
    let value = this.value_expression.eval(data)

    node[name] = value
  }

  ['input checked'] (data) {
    let node = this.node
    let value = this.value_expression.eval(data)

    node.checked = !!value
  }

  ['input focus'] () {
    let node = this.node
    let value = this.value_expression.eval(data)

    if (!value) {
      return
    }

    node.focus()
  }

}
