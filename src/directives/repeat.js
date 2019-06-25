'use strict'

import { Directive } from './directive.js'
import { Expression } from '../expression.js'

export class DirectiveRepeat extends Directive {

  static get type () { return 'repeat' }

  static get default () {
    return {
      item_name: 'item',
      index_name: 'index'
    }
  }

  static match (attribute) {
    return attribute.name === 'repeat'
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }
    if (node.nodeName.toLowerCase() !== 'template') {
      return
    }

    let items_path = node.getAttribute('repeat') || this.items_path
    let item_name = node.getAttribute('item') || this.default.item_name
    let index_name = node.getAttribute('index') || this.default.index_name

    let directive = new this({ node, items_path, item_name, index_name })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.items_path = options.items_path
    this.expression = new Expression(this.items_path)
    this.item_name = options.item_name
    this.index_name = options.index_name

    this.content = this.node.content.children[0]

    this.wrapper = document.createElement('scope')
    this.wrapper.style.display = 'contents'
    this.node.parentNode.insertBefore(this.wrapper, this.node.nextSibling)
    // this.container = document.createElement('scope')
    // this.container.style.display = 'contents'
    // this.node.parentNode.insertBefore(this.container, this.node.nextSibling)
    // this.container.appendChild(this.node)
  }

  run (data, context) {
    let node = this.node
    node._nodes = node._nodes || []
    node._items = node._items || []
    node._new_items = this.expression.eval(data) || []

    let items_count = node._items.length
    let new_items_count = node._new_items.length

    if (new_items_count < items_count) {
      for (let index = 0; index < new_items_count; index++) {
        this._update_node(node, index, data, context)
      }
      for (let index = new_items_count; index < items_count; index++) {
        this._remove_node(node, index)
      }
    }
    else {
      for (let index = 0; index < items_count; index++) {
        this._update_node(node, index, data, context)
      }
      for (let index = items_count; index < new_items_count; index++) {
        this._create_node(node, index, data, context)
      }
    }

    node._items = node._new_items//.slice()
  }

  _create_node (node, index, data, context) {
    let child = this.content.cloneNode(true)
    node._nodes[index] = child

    this._insert_node(child)

    this._update_node(node, index, data, context)

    return child
  }

  _insert_node (node) {
    // this.wrapper.appendChild(node)
    this.wrapper.parentNode.insertBefore(node, this.wrapper)
  }

  _update_node (node, index, data, context) {
    let nodes = node._nodes
    let child = nodes[index]
    if (!child) {
      return
    }

    let scope = {}
    let item = node._new_items[index]
    scope[this.item_name] = item
    scope[this.index_name] = index
    child.scope = scope

    // let detail = { index: index, data: scope, node: director_node }
    // let config = { bubbles: true, cancelable: true, detail: detail }
    // let event = new CustomEvent('render', config)
    // node.dispatchEvent(event)

    // this.director.render(director_node, new_data, context)
  }

  _remove_node (node, index) {
    let nodes = node._nodes
    let child = nodes[index]
    if (!child) {
      return
    }
    child.remove()
    nodes[index] = null
  }

}
