'use strict'

import Register from '../register/index.js'
import Path from '../path/index.js'

export default superclass => class extends superclass {

  static get config () {
    return {
      ...super.config,
      components_path: 'components/'
    }
  }

  constructor () {
    super()
  }

  async start () {
    super.start()

    let base_url = this.base_url
    let config = this.constructor.config

    let components_path = config.components_path
    this.components_path = Path.join(base_url, components_path)
    this.components = {}

    this.register = new Register({ components_path: this.components_path })

    this.root.addEventListener('ready', this.on_component_ready.bind(this), true)
  }

  on_component_ready (event) {
    let component = event.detail

    let components = component.components
    if (!components || !components.length) {
      return
    }

    this.register.get_components(components)
  }

}