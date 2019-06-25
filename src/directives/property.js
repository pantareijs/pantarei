'use strict'

import { Directive } from './directive.js'
import { Expression } from '../expression.js'

export class DirectiveProperty extends Directive {

  static get type () { return 'property' }

  static get _prefix () { return 'prop.' }

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

    let node_name = this.node.nodeName.toLowerCase()
    let prop_name = this.name
    let func_name = node_name + ' ' + prop_name
    let handler = this[func_name]
    if (handler) {
      this.run = handler
    }
  }

  run (data) {
    let value = this.expression.eval(data)
    this.node[this.name] = value
    this.value = value
  }

  ['input checked'] (data) {
    let value = this.expression.eval(data)
    this.node.checked = !!value
  }

  ['input focus'] () {
    let value = this.expression.eval(data)
    if (!!value) {
      this.node.focus()
    }
  }

}
