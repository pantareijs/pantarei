'use strict'

import { Directive } from './directive.js'
import { Expression } from '../expression.js'

export class DirectiveToggle extends Directive {

  static get type () { return 'if' }

  static match (attribute) {
    return attribute.name === 'if'
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }
    if (node.nodeName.toLowerCase() !== 'template') {
      return
    }

    let content = node.content.children[0]
    let director_node = document.importNode(content, true)
    let path = node.getAttribute('if')

    let directive = new this({ node, path, director_node })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.path = options.path
    this.expression = new Expression(this.path)

    this.content = this.node.content.children[0]

    this.wrapper = document.createElement('scope')
    this.wrapper.style.display = 'contents'
    this.node.parentNode.insertBefore(this.wrapper, this.node.nextSibling)

    this._created = false
    this._attached = false
  }

  run (data, context) {
    let node = this.node
    node._test = this.expression.eval(data) || false

    if (node._test) {
      this._attach_node()
    } else {
      this._detach_node()
    }
  }

  _create_node () {
    let _node = this.content.cloneNode(true)
    this._node = _node
    this.wrapper.parentNode.insertBefore(_node, this.wrapper)
    this._created = true
  }

  _attach_node () {
    if (this._attached) {
      return
    }
    if (!this._created) {
      this._create_node()
    }
    this._node.style.display = 'block'
    this._attached = true
  }

  _detach_node () {
    if (!this._attached) {
      return
    }
    this._node.style.display = 'none'
    this._attached = false
  }

}
