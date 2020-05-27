'use strict'

import Directive from '../directive/index.js'

export default class DirectiveToggle extends Directive {

  static prefix = 'if'

  constructor (options) {
    super(options)

    this.content = this.node.firstElementChild
    this.template = document.createElement('template')
    this.template.content.appendChild(this.content)
    this.node.insertBefore(this.template, this.content)

    this._created = false
    this._attached = false
  }

  run (data) {
    let test = this.value_expression.eval(data)

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
    this._node.style.display = 'content'
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
