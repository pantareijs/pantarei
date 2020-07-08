'use strict'

import Container from '../container/index.js'
import Path from '../path/index.js'

export default superclass => class extends superclass {

  static get config () {
    return {
      ...super.config,
      container_name: 'app-container'
    }
  }

  async start () {
    super.start()

    let config = this.constructor.config
    let base_url = this.base_url

    let components_path = config.components_path
    let container_name = config.container_name
    let container_path = Path.join(base_url, components_path, container_name, 'index.js')

    let container_module
    let container_constructor
    try {
      container_module = await import(container_path)
      container_constructor = container_module.default
    } catch (err) {
      container_constructor = Container
    }
    this.register.define_component(container_name, container_constructor)

    let container = document.createElement(container_name)

    this.container = container
    this.root.appendChild(container)

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
