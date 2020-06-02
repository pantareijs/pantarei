'use strict'

export default superclass => class extends superclass {

  async init () {
    super.init()
    await this.locks.unlocked('render')
    await this.init_observer()
    this.locks.unlock('observer')
  }

  async init_observer () {
    this.on_mutation = this.on_mutation.bind(this)
    this.observer = new MutationObserver(this.on_mutation)
    this.observer.observe(this.shadowRoot, {
      attributes: false,
      childList: true,
      subtree: true
    })
  }

  on_mutation (mutations) {
    let component = this
    let mutated = false

    for (let mutation of mutations) {
      let nodes = mutation.addedNodes

      for (let node of nodes) {
        if (node.nodeType === 1) {
          component._parse_node(node)
          mutated = true
        }
      }

    }

    if (mutated) {
      component.render()
    }
  }

}