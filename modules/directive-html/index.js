'use strict'

import Directive from '../directive/index.js'

export default class DirectiveHtml extends Directive {

  static prefix = 'html'

  run (data) {
    let node = this.node
    let value = this.value_expression.eval(data)

    if (!value) {
      value = ''
    }
    if (value === this.prev) {
      return
    }

    node.innerHTML = value
    this.prev = value
  }

}
