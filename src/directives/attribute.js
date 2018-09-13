'use strict'

import { Directive } from './directive'
import { getter } from '../utils/getter'

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
    this.getter = getter(this.path)
  }

  run (node, context) {
    let name = this.name
    let value = this.getter(context)

    if (node.nodeName === 'A') {
      if (name === 'href') {
        if (value === undefined) {
          node.removeAttribute(name)
          return
        }
      }

      if (name === 'target') {
        if (value === undefined) {
          node.removeAttribute(name)
          return
        }
      }
    }

    if (node.nodeName === 'INPUT' || node.nodeName === 'BUTTON') {
      if (name === 'disabled') {
        if (!value) {
          node.removeAttribute('disabled')
          return
        }

        node.setAttribute('disabled', 'disabled')
        return
      }
    }

    if (!value) {
      value = ''
    }

    node.setAttribute(name, value)
  }

}