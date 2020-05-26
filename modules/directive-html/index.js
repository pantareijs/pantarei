'use strict'

import Directive from '../directive/index.js'
import Expression from '../expression/index.js'

export default class DirectiveHtml extends Directive {

  static get type () { return 'html' }

  static match (attribute) {
    return attribute.name === 'html'
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
    let node = this.node
    let value = this.expression.eval(data)

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
