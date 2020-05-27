'use strict'

import Directive from '../directive/index.js'

export default class DirectiveAttribute extends Directive {

  static prefix = 'attr.'

  run (data) {
    let node = this.node
    let name = this.key
    let value = this.value_expression.eval(data)

    if (!value) {
      node.removeAttribute(name)
      return
    }

    node.setAttribute(name, value)
  }

}