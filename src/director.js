'use strict'

import DirectiveAttribute from './directives/attribute.js'
import DirectiveClassName from './directives/classname.js'
import DirectiveData from './directives/data.js'
import DirectiveEvent from './directives/event.js'
import DirectiveProperty from './directives/property.js'
import DirectiveRepeat from './directives/repeat.js'
import DirectiveStyle from './directives/style.js'
import DirectiveToggle from './directives/toggle.js'
import DirectiveText from './directives/text.js'
import DirectiveHtml from './directives/html.js'

export default class Director {

  static get directives () {
    return [
      DirectiveAttribute,
      DirectiveClassName,
      DirectiveData,
      DirectiveEvent,
      DirectiveProperty,
      DirectiveRepeat,
      DirectiveStyle,
      DirectiveToggle,
      DirectiveText,
      DirectiveHtml
    ]
  }

  constructor (component) {
    this.component = component
    this.root = component.shadowRoot

    this._observe = this._observe.bind(this)
    this._observer = new MutationObserver(this._observe)
  }

  _observe (mutations) {
    let data = this.component.data

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

    this._observer.observe(this.root, {
      attributes: false,
      childList: true,
      subtree: true
    })
  }

  _parse_node (node, recursive=true) {
    if (node._parsed) {
      return
    }
    if (node.attributes) {
      this._parse_directives(node)
    }
    if (!recursive) {
      return
    }
    let children = node.children
    this._parse_nodes(children, recursive)
    node._parsed = true
  }

  _parse_nodes (nodes, recursive=true) {
    for (let node of nodes) {
      this._parse_node(node, recursive)
    }
  }

  _parse_directives (node) {
    node._directives = node._directives || []
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

  render () {
    let node = this.root
    let data = this.component.data
    let node_scope = node.scope || {}
    this._render_node(node, data, node_scope)
  }

  _render_node (node, data, scope, recursive=true) {
    let node_scope = node.scope || {}
    scope = Object.assign({}, node_scope, scope)
    this._render_directives(node, data, scope)
    if (!recursive) {
      return
    }
    let nodes = node.children
    this._render_nodes(nodes, data, scope, recursive)
  }

  _render_nodes (nodes, data, scope, recursive=true) {
    for (let node of nodes) {
      this._render_node(node, data, scope, recursive)
    }
  }

  _render_directives (node, data, scope) {
    let directives = node._directives || []
    for (let directive of directives) {
      this._render_directive(node, directive, data, scope)
    }
  }

  _render_directive (node, directive, data, scope) {
    directive.run({ data, scope })
  }

}