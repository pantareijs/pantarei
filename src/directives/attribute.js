'use strict'

import { Directive } from './directive.js'
import { Expression } from '../expression.js'

export class DirectiveAttribute extends Directive {

  static get type () { return 'attribute' }

  static get _prefix () { return 'attr.' }

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
    let attr_name = this.name
    let func_name = node_name + ' ' + attr_name
    let handler = this[func_name]
    if (handler) {
      this.run = handler
    }
  }

  run (data) {
    let node = this.node
    let name = this.name
    let value = this.expression.eval(data)

    if (!value) {
      value = ''
      node.removeAttribute(name)
      return
    }

    node.setAttribute(name, value)
  }

  ['a href'] (data) {
    let value = this.expression.eval(data)

    if (value === undefined) {
      this.node.removeAttribute('href')
      return
    }

    this.node.setAttribute('href', value)
  }

  ['a target'] (data) {
    let value = this.expression.eval(data)

    if (value === undefined) {
      this.node.removeAttribute('target')
      return
    }

    this.node.setAttribute('target', value)
  }

  ['input disabled'] (data) {
    let value = this.expression.eval(data)

    if (!value) {
      this.node.removeAttribute('disabled')
      return
    }

    this.node.setAttribute('disabled', 'disabled')
  }

  ['button disabled'] (data) {
    let value = this.expression.eval(data)

    if (!value) {
      this.node.removeAttribute('disabled')
      return
    }

    this.node.setAttribute('disabled', 'disabled')
  }

}