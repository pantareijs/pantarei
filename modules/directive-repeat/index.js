'use strict'

import Directive from '../directive/index.js'
import Expression from '../expression/index.js'

export default class DirectiveRepeat extends Directive {

  static prefix = 'repeat'

  static default = {
    items_path: 'data.items',
    item_name: 'item',
    index_name: 'index',
    key_name: 'key',
    value_name: 'value'
  }

  static parse (node, attribute) {
    if (!this.match(node, attribute)) {
      return
    }

    let key = this.parse_key(attribute)
    let value_path = this.parse_value_path(attribute)
    let value_expression = new Expression(value_path)

    let items_path = node.getAttribute('repeat') || this.default.items_path
    let item_name = node.getAttribute('item') || this.default.item_name
    let index_name = node.getAttribute('index') || this.default.index_name
    let key_name = node.getAttribute('key') || this.default.key_name
    let value_name = node.getAttribute('value') || this.default.value_name

    let directive = new this({ node, key, value_path, value_expression,
      items_path, item_name, index_name, key_name, value_name })

    return directive
  }

  constructor (options) {
    super(options)

    this.node = options.node
    this.items_path = options.items_path
    this.item_name = options.item_name
    this.index_name = options.index_name
    this.key_name = options.key_name
    this.value_name = options.value_name

    let node_name = this.node.nodeName.toLowerCase()
    if (node_name === 'template') {
      this.template = this.node
      this.content = this.template.content.firstElementChild
    } else {
      this.template = document.createElement('template')
      this.content = this.node.firstElementChild
      this.node.insertBefore(this.template, this.content)
      this.template.content.appendChild(this.content)
    }

    this.node._items = []
    this.node._new_items = []
    this.node._nodes = []
  }

  run (data) {
    let node = this.node

    node._items = node._items || []
    node._new_items = this.value_expression.eval(data) || []

    let items_count = node._items.length
    let new_items_count = node._new_items.length

    if (new_items_count < items_count) {
      for (let index = 0; index < new_items_count; index++) {
        this._update_child(index)
      }
      for (let index = new_items_count; index < items_count; index++) {
        this._remove_child(index)
      }
    }
    else {
      for (let index = 0; index < items_count; index++) {
        this._update_child(index)
      }
      for (let index = items_count; index < new_items_count; index++) {
        this._create_child(index)
        this._update_child(index)
        this._insert_child(index)
      }
    }

    node._items = node._new_items.slice()
  }

  _create_child (index, data) {
    let node = this.node
    let children = node._nodes
    let child = this.content.cloneNode(true)
    children[index] = child
    return child
  }

  _insert_child (index) {
    let node = this.node
    let children = node._nodes
    let child = children[index]
    if (!child) {
      return
    }
    this.template.parentNode.insertBefore(child, this.template)
  }

  _update_child (index) {
    let node = this.node
    let children = node._nodes
    let child = children[index]
    if (!child) {
      return
    }

    let scope = {}
    let item = node._new_items[index]
    scope[this.item_name] = item
    scope[this.index_name] = index
    child.scope = scope

    return child
  }

  _remove_child (index) {
    let node = this.node
    let children = node._nodes
    let child = children[index]
    if (!child) {
      return
    }

    child.remove()
    children[index] = null

    return child
  }

  _clear () {
    let node = this.node
    node._nodes = node._nodes.filter(node => node)
  }

}
