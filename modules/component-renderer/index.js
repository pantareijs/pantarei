'use strict'

import Lock from '../lock/index.js'
import Throttler from '../throttler/index.js'

export default superclass => class extends superclass {

  async init () {
    if (super.init) {
      super.init()
    }
    this.lock_render = new Lock()
    await this.lock_parsed.unlocked
    this.init_render()
  }

  async init_render () {
    this._render = this._render.bind(this)
    this.render = Throttler.throttle(this._render)
    this.lock_render.unlock()
  }

  _render (data) {
    data = data || this.data || {}
    let node = this.shadowRoot
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