'use strict'

import Directive from '../directive/index.js'

export default class DirectiveText extends Directive {

  static prefix = 'text'

  run (data) {
    let value = this.value_expression.eval(data)

    if (value === null) {
      value = ''
    }

    if (value === undefined) {
      value = ''
    }

    if (typeof value === 'number') {
      value = '' + value
    }

    if (typeof value !== 'string') {
      value = ''
    }

    let new_text = '' + value

    let old_text = this.node.innerText

    if (new_text === old_text) {
      return
    }

    this.node.innerText = new_text
  }

}
