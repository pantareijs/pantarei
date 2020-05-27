'use strict'

import Directive from '../directive/index.js'

export default class DirectiveData extends Directive {

  static prefix = 'data.'

  run (data) {
    let node = this.node
    let name = this.key
    let value = this.value_expression.eval(data)

    node.data = node.data || {}
    node.data[name] = value
  }

}
