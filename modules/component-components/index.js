'use strict'

export default superclass => class extends superclass {

  async init () {
    super.init()
    await this.locks.unlocked('content')
    this.components = this.find_components(this.shadowRoot)
    this.locks.unlock('components')
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
      for (let child_component of child_components) {
        components.add(child_component)
      }
    }

    return components
  }

}