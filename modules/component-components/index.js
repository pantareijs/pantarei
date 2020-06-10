'use strict'

export default superclass => class extends superclass {

  static components = []

  async init () {
    super.init()
    await this.locks.unlocked('content')
    this.components = this.find_components(this.shadowRoot)
    this.locks.unlock('components')
  }

  find_components (node) {
    let components = this.constructor.components || []

    if (node.nodeType === Node.ELEMENT_NODE) {
      let component_name = node.nodeName.toLowerCase()

      if (component_name.includes('-')) {
        if (!components.includes(component_name))
          components.push(component_name)
      }

      if (component_name === 'template') {
        node = node.content
      }
    }

    let children = node.children
    for (let child of children) {
      let component_names = this.find_components(child)
      for (let component_name of component_names) {
        if (!components.includes(component_name)) {
          components.push(component_name)
        }
      }
    }

    return components
  }

}