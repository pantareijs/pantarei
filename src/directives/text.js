'use strict'

import { Directive } from './directive'
import { getter } from '../utils/getter'

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
    this.getter = getter(this.path)
  }

  run (node, data) {
    let value = this.getter(data)
    node.innerText = value
  }

}
