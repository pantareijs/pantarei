'use strict'

import Directive from '../directive/index.js'
import Expression from '../expression/index.js'

export default class DirectiveToggle extends Directive {

  static get type () { return 'if' }

  static match (attribute) {
    return attribute.name === 'if'
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let path = node.getAttribute('if')

    let directive = new this({ node, path })

    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.path = options.path
    this.expression = new Expression(this.path)

    this.content = this.node.firstElementChild

    this.template = document.createElement('template')
    this.node.insertBefore(this.template, this.content)
    this.template.content.appendChild(this.content)

    this._created = false
    this._attached = false
  }

  run (data, context) {
    let test = this.expression.eval(data) || false

    if (test) {
      this._attach_node()
      return
    }

    this._detach_node()
  }

  _create_node () {
    let _node = this.content.cloneNode(true)
    this._node = _node
    this.template.parentNode.insertBefore(_node, this.template)
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
