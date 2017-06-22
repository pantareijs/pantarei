import { Director } from './director'
import { ExpressionPath } from './expression-path'

export class DirectiveRepeat {

  static get type () { return 'repeat' }

  static get items_name () { return 'items' }

  static get item_name () { return 'item' }

  static get index_name () { return 'index' }

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

    let content = node.content.children[0]
    let director_node = document.importNode(content, true)
    let items_name = node.getAttribute('repeat') || this.items_name
    let item_name = node.getAttribute('item') || this.item_name
    let index_name = node.getAttribute('index') || this.index_name
    let items_expression = new ExpressionPath(items_name)

    let directive = new this({ node, items_expression, item_name, index_name, director_node })
    return directive
  }

  constructor (options) {
    this.node = options.node
    this.items_expression = options.items_expression
    this.item_name = options.item_name
    this.index_name = options.index_name
    this.director_node = options.director_node
    this.director = new Director(this.node._root_node)
  }

  _create_director_node (node, index) {
    let new_director_node = this.director_node.cloneNode(true)
    this.director.parse(new_director_node)
    node._director_nodes[index] = new_director_node
    return new_director_node
  }

  _remove_director_node (node, index) {
    let director_node = node._director_nodes[index]
    if (!director_node) {
      return
    }
    director_node.remove()
    node._director_nodes[index] = null
  }

  _render_director_node (node, index, data, context) {
    let director_node = node._director_nodes[index]
    if (!director_node) {
      return
    }
    let new_data = Object.assign({}, data)
    let item = node._new_items[index]
    new_data[this.item_name] = item
    new_data[this.index_name] = index

    let detail = { index: index, data: new_data, node: director_node }
    let config = { bubbles: true, cancelable: true, detail: detail }
    let event = new CustomEvent('render', config)
    node.dispatchEvent(event)

    this.director.render(director_node, new_data, context)
  }

  run (node, data, context) {
    node._director_nodes = node._director_nodes || []
    node._items = node._items || []
    node._new_items = this.items_expression.evaluate(data) || []

    let items_count = node._items.length
    let new_items_count = node._new_items.length

    if (new_items_count < items_count) {
      for (let index = 0; index < new_items_count; index++) {
        this._render_director_node(node, index, data, context)
      }
      for (let index = new_items_count; index < items_count; index++) {
        this._remove_director_node(node, index)
      }
    }
    else {
      for (let index = 0; index < items_count; index++) {
        this._render_director_node(node, index, data, context)
      }
      let fragment = document.createDocumentFragment()
      for (let index = items_count; index < new_items_count; index++) {
        let director_node = this._create_director_node(node, index)
        this._render_director_node(node, index, data, context)
        fragment.appendChild(director_node)
      }
      node.parentNode.insertBefore(fragment, node)
    }

    node._items = node._new_items.slice()
  }

}