'use strict'

export default superclass => class extends superclass {

  async init () {
    super.init()
    await this.locks.unlocked('content')
    this.parts = this.find_elements(this.shadowRoot, 'part')
    this.refs = this.find_elements(this.shadowRoot, 'id')
    this.locks.unlock('parts')
  }

  find_elements (node, attribute_name) {
    let selector = `[${attribute_name}]`
    let nodes = node.querySelectorAll(selector).values()

    let parts = {}

    for (let node of nodes) {
      let part_name = node.getAttribute(attribute_name)
      parts[part_name] = node
    }

    return parts
  }

}