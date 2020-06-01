'use strict'

import Lock from '../lock/index.js'

export default superclass => class extends superclass {

  async init () {
    if (super.init) {
      super.init()
    }
    this.lock_components = new Lock()
    await this.lock_content.unlocked
    this.init_components()
  }

  async init_components () {
    this.components = this.find_components(this.shadowRoot)
    this.lock_components.unlock()
  }

  find_components (node) {
    let components = new Set()

    if (node.nodeType === Node.ELEMENT_NODE) {
      let node_name = node.nodeName.toLowerCase()

      if (node_name.includes('-')) {
        components.add(node_name)
      }

      if (node.nodeName === 'template') {
        node = node.content
      }
    }

    let children = node.children
    for (let child of children) {
      let child_components = this.find_components(child)
      components = new Set([...components, ...child_components])
    }

    return components
  }

}