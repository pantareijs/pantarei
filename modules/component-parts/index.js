'use strict'

export default superclass => class extends superclass {

  async init () {
    super.init()
    await this.locks.unlocked('content')
    this.parts = this.find_parts(this.shadowRoot)
    this.locks.unlock('parts')
  }

  find_parts (node) {
    let nodes = node.querySelectorAll('[part]').values()

    let parts = new Map()

    for (let node of nodes) {
      let part_name = node.getAttribute('part')
      parts.set(part_name, node)
    }

    return parts
  }

}