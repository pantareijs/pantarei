'use strict'

import Directive from './directive.js'
import Expression from '../expression.js'

export default class ClassDirective extends Directive {

  static get type () { return 'class' }

  static get _prefix () { return 'class.' }

  static match (attribute) {
    return attribute.name.startsWith(this._prefix)
  }

  static parse_name (attribute) {
    return attribute.name.substring(this._prefix.length)
  }

  static parse_value (attribute) {
    return attribute.value
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }
    if (!node.classList) {
      return
    }

    let name = this.parse_name(attribute)
    let path = this.parse_value(attribute)
    let directive = new this({ node, name, path })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.name = options.name
    this.path = options.path
    this.expression = new Expression(this.path)
  }

  run (data) {
    let node = this.node
    let name = this.name
    let value = this.expression.eval(data)
    node.classList.toggle(this.name, !!value)
  }

}