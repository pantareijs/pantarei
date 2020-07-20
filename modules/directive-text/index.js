'use strict'

import Directive from '../directive/index.js'

export default class DirectiveText extends Directive {

  static prefix = 'text'

  run (data) {
    let value = this.value_expression.eval(data)

    if (typeof value === 'number') {
      value = '' + value
    }

    if (typeof value !== 'string') {
      value = ''
    }

    let current_value = this.node.innerText

    if (value === current_value) {
      return
    }

    this.node.innerText = value
  }

}
