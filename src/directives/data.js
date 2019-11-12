'use strict'

import { Directive } from './directive.js'
import { Expression } from '../expression.js'

export class DirectiveData extends Directive {

  static get type () { return 'data' }

  static get _prefix () { return 'data.' }

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
    let name = this.name
    let value = this.expression.eval(data)

    this.node.data = this.node.data || {}
    this.node.data[name] = value
  }

}
