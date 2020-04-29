'use strict'

import Directive from './directive.js'
import Expression from '../expression.js'

export default class RepeatDirective extends Directive {

  static get type () { return 'repeat' }

  static get default () {
    return {
      items_path: 'data.items',
      item_name: 'item',
      index_name: 'index',
      key_name: 'key',
      value_name: 'value'
    }
  }

  static match (attribute) {
    return attribute.name === 'repeat'
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let items_path = node.getAttribute('repeat') || this.default.items_path
    let item_name = node.getAttribute('item') || this.default.item_name
    let index_name = node.getAttribute('index') || this.default.index_name
    let key_name = node.getAttribute('key') || this.default.key_name
    let value_name = node.getAttribute('value') || this.default.value_name

    let directive = new this({ node, items_path, item_name, index_name, key_name, value_name })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.items_path = options.items_path
    this.expression = new Expression(this.items_path)
    this.item_name = options.item_name
    this.index_name = options.index_name
    this.key_name = options.key_name
    this.value_name = options.value_name

    this.content = this.node.firstElementChild

    this.template = document.createElement('template')
    this.node.insertBefore(this.template, this.content)
    this.template.content.appendChild(this.content)
  }

  run (data) {
    let node = this.node
    node._nodes = node._nodes || []

    node._new_items = this.expression.eval(data) || []

    let items_count = node._nodes.length
    let new_items_count = node._new_items.length

    if (new_items_count < items_count) {
      for (let index = 0; index < new_items_count; index++) {
        this._update_child(index, data)
      }
      for (let index = new_items_count; index < items_count; index++) {
        this._remove_child(index)
      }
    }
    else {
      for (let index = 0; index < items_count; index++) {
        this._update_child(index, data)
      }
      for (let index = items_count; index < new_items_count; index++) {
        this._create_child(index, data)
      }
    }

    node._items = node._new_items
  }

  _create_child (index, data) {
    let node = this.node
    let children = node._nodes
    let child = this.content.cloneNode(true)

    children[index] = child
    this._update_child(index, data)
    this._insert_child(child)

    return child
  }

  _insert_child (child) {
    this.template.parentNode.insertBefore(child, this.template)
  }

  _update_child (index, data) {
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

}
