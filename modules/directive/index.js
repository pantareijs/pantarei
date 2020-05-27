'use strict'

import Expression from '../expression/index.js'

export default class Directive {

  static get prefix () {
    throw new Error('static property `prefix` must be overridden')
  }

  static match (node, attribute) {
    return attribute.name.startsWith(this.prefix)
  }

  static parse_key (attribute) {
    return attribute.name.substring(this.prefix.length)
  }

  static parse_value_path (attribute) {
    return attribute.value
  }

  static parse (node, attribute) {
    if (!this.match(node, attribute)) {
      return
    }

    let key = this.parse_key(attribute)
    let value_path = this.parse_value_path(attribute)
    let value_expression = new Expression(value_path)
    let directive = new this({ node, key, value_path, value_expression })

    return directive
  }

  constructor (options) {
    this.node = options.node
    this.key = options.key
    this.value_path = options.value_path
    this.value_expression = options.value_expression
  }

  run (data) {}

}
