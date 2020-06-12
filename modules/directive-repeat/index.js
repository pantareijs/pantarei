'use strict'

import Directive from '../directive/index.js'
import Expression from '../expression/index.js'

export default class DirectiveRepeat extends Directive {

  static prefix = 'repeat'

  static params = {
    items_path: 'data.items',
    item_name: 'item',
    index_name: 'index',
    key_name: 'key',
    value_name: 'value'
  }

  constructor (options) {
    super(options)

    let node = this.node

    let default_params = this.constructor.params
    let params = this.params = {}
    params.items_path = node.getAttribute('repeat') || default_params.items_path
    params.item_name = node.getAttribute('item') || default_params.item_name
    params.index_name = node.getAttribute('index') || default_params.index_name
    params.key_name = node.getAttribute('key') || default_params.key_name
    params.value_name = node.getAttribute('value') || default_params.value_name

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

    let item_name = this.params.item_name
    let index_name = this.params.index_name

    let scope = {}
    let item = node._new_items[index]
    scope[item_name] = item
    scope[index_name] = index
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
