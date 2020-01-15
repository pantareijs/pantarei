'use strict'

import { Directive } from './directive.js'
import { Expression } from '../expression.js'

export class DirectiveText extends Directive {

  static get type () { return 'text' }

  static match (attribute) {
    return attribute.name === 'text'
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let path = attribute.value
    let directive = new this({ node, path })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.path = options.path
    this.expression = new Expression(this.path)
  }

  run (data) {
    let value = this.expression.eval(data)

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
