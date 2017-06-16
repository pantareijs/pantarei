import { Director } from './director'
import { ExpressionPath } from './expression-path'

export class DirectiveRepeat {

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
    let items_name = node.getAttribute('repeat') || 'items'
    let item_name = node.getAttribute('item') || 'item'
    let index_name = node.getAttribute('index') || 'index'
    let items_expression = new ExpressionPath(items_name)

    let directive = new this({ items_expression, item_name, index_name, director_node })
    return directive
  }

  constructor (options) {
    this.items_expression = options.items_expression
    this.item_name = options.item_name
    this.index_name = options.index_name
    this.director_node = options.director_node
    this.director = new Director()
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

  _render_director_node (node, index, context) {
    let director_node = node._director_nodes[index]
    if (!director_node) {
      return
    }
    let new_context = Object.assign({}, context)
    let item = node._new_items[index]
    new_context[this.item_name] = item
    new_context[this.index_name] = index

    let detail = { index: index, data: new_context, node: director_node }
    let config = { bubbles: true, cancelable: true, detail: detail }
    let event = new CustomEvent('render', config)
    node.dispatchEvent(event)

    this.director.render(director_node, new_context)
    // for (let directed_node of director_node._directed_nodes) {
    //   for (let directive of directed_node._directives) {
    //     directive.run(directed_node, new_context)
    //   }
    // }
  }

  run (node, context) {
    node._director_nodes = node._director_nodes || []
    node._items = node._items || []
    node._new_items = this.items_expression.evaluate(context) || []

    let items_count = node._items.length
    let new_items_count = node._new_items.length

    if (new_items_count < items_count) {
      for (let index = 0; index < new_items_count; index++) {
        this._render_director_node(node, index, context)
      }
      for (let index = new_items_count; index < items_count; index++) {
        this._remove_director_node(node, index)
      }
    }
    else {
      for (let index = 0; index < items_count; index++) {
        this._render_director_node(node, index, context)
      }
      let fragment = document.createDocumentFragment()
      for (let index = items_count; index < new_items_count; index++) {
        let director_node = this._create_director_node(node, index)
        this._render_director_node(node, index, context)
        fragment.appendChild(director_node)
      }
      node.parentNode.insertBefore(fragment, node)
    }

    node._items = node._new_items.slice()
  }

}