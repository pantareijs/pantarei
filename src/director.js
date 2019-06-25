'use strict'

export class Director {

  constructor (component) {
    this.component = component
    this.root = component.shadowRoot

    this._observe = this._observe.bind(this)
    this._observer = new MutationObserver(this._observe)
  }

  _observe (mutations) {
    let to_render = false

    for (let mutation of mutations) {
      let nodes = mutation.addedNodes

      for (let node of nodes) {
        if (node.nodeType === 1) {
          this._parse_node(node)
          to_render = true
        }
      }

    }

    if (to_render) {
      this.component._renderer.render()
    }
  }

  parse () {
    this._parse_node(this.root)

    let observing = {
      attributes: false,
      childList: true,
      subtree: true
    }

    this._observer.observe(this.root, observing)
  }

  _parse_node (node) {
    if (node._parsed) {
      return
    }
    if (node.attributes) {
      this._parse_directives(node)
    }
    let children = node.children
    for (let child of children) {
      this._parse_node(child)
    }
    node._parsed = true
  }

  _parse_directives (node) {
    node._directives = []
    let attributes = Array.from(node.attributes)
    for (let attribute of attributes) {
      this._parse_directive(node, attribute)
    }
  }

  _parse_directive (node, attribute) {
    let directive_constructors = this.constructor.directives
    for (let directive_constructor of directive_constructors) {
      let directive = directive_constructor.parse(node, attribute)
      if (directive) {
        node._directives.push(directive)
      }
    }
  }

  render (data) {
    this._render_node(this.root, data)
  }

  _render_node (node, data) {
    let new_data = {}
    for (let prop in data) {
      new_data[prop] = data[prop]
    }
    let scope = node.scope || {}
    for (let prop in scope) {
      new_data[prop] = scope[prop]
    }

    let directives = node._directives
    if (directives) {
      for (let directive of directives) {
        directive.run(new_data)
      }
    }

    let next = node.firstElementChild
    while (next) {
      this._render_node(next, new_data)
      next = next.nextElementSibling
    }
  }

}