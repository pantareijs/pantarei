'use strict'

export default superclass => class extends superclass {

  async init () {
    if (super.init) {
      super.init()
    }
    await this.lock_content.unlocked
    this.init_parts()
  }

  init_parts () {
    this.parts = this.find_parts(this.shadowRoot)
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