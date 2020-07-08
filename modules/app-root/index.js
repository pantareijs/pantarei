'use strict'

export default superclass => class extends superclass {

  static get config () {
    return {
      ...super.config,
      root_id: 'root'
    }
  }

  async start () {
    super.start()

    let config = this.constructor.config

    let root = config.root || document.getElementById(config.root_id)
    if (!root) {
      throw new Error('root is undefined')
    }
    if (!(root instanceof HTMLElement)) {
      throw new Error('root is not an HTML element')
    }

    this.root = root
    this.root.app = this
  }

}