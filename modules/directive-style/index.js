'use strict'

import Directive from '../directive/index.js'

export default class DirectiveStyle extends Directive {

  static prefix = 'style.'

  run (data) {
    let node = this.node
    let name = this.name
    let value = this.value_expression.eval(data)

    node.style[name] = value
  }

}