'use strict'

import Lock from '../lock/index.js'

export default superclass => class extends superclass {

  async init () {
    if (super.init) {
      super.init()
    }
    this.lock_parsed = new Lock()
    await this.parse()
  }

  async parse () {
    await this.lock_shadow.unlocked
    this._parse_node(this.shadowRoot)
    this.lock_parsed.unlock()
  }

  _parse_node (node, recursive=true) {
    if (node._parsed) {
      return
    }
    if (node.attributes) {
      this._parse_attributes(node)
    }
    if (!recursive) {
      return
    }
    if (node.children) {
      this._parse_children(node, recursive)
    }
    node._parsed = true
  }

  _parse_children (node, recursive=true) {
    for (let child of node.children) {
      this._parse_node(child, recursive)
    }
  }

  _parse_attributes (node) {
    for (let attribute of node.attributes) {
      this._parse_attribute(node, attribute)
    }
  }

  _parse_attribute (node, attribute) {
    let directive = this._find_directive(node, attribute)
    if (!directive) {
      return
    }
    let directives = node.directives
    if (!directives) {
      directives = node.directives = []
    }
    directives.push(directive)
  }

  _find_directive (node, attribute) {
    let directive_constructors = this.constructor.directives

    for (let directive_constructor of directive_constructors) {
      let directive = directive_constructor.parse(node, attribute)
      if (directive) {
        return directive
      }
    }
  }

}