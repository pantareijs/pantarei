'use strict'

import { Directive } from './directive'
import { getter } from '../utils/getter'

export class DirectiveClassName extends Directive {

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
    this.getter = getter(this.path)
  }

  run (node, context) {
    let name = this.name
    let value = this.getter(context)
    node.classList.toggle(this.name, !!value)
  }

}