'use strict'

import Directive from '../directive/index.js'

export default class DirectiveClass extends Directive {

  static prefix = 'class.'

  static match (node, attribute) {
    if (!node.classList) {
      return
    }
    return super.match(node, attribute)
  }

  run (data) {
    let node = this.node
    let name = this.key
    let value = this.value_expression.eval(data)

    node.classList.toggle(name, !!value)
  }

}