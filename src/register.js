'use strict'

import Component from './component.js'
import Path from './path.js'

export default class Register {

  constructor (config) {
    this.components_path = config.components_path

    this._components = {}
    this._promises = {}
  }

  get_component_url (component_name) {
    let url = Path.concat(this.components_path, component_name, 'index.js')
    return url
  }

  get_components (components) {
    let promises = []
    for (let component_name of components) {
      let promise = this.get_component(component_name)
      promises.push(promise)
    }
    return promises
  }

  get_component (component_name) {
    let promise = this._promises[component_name]
    if (!promise) {
      promise = this._load_component(component_name)
    }
    return promise
  }

  async _load_component (component_name) {
    let component_constructor = this._components[component_name]
    if (component_constructor) {
      return component_constructor
    }

    let module_url = this.get_component_url(component_name)
    try {
      let module_obj = await import(module_url)
      component_constructor = module_obj.default
    } catch (error) {
      component_constructor = (class extends Component {})
    }

    component_constructor.base_url = module_url
    this.define_component(component_name, component_constructor)
    return component_constructor
  }

  define_component (component_name, component_constructor) {
    try {
      if (!window.customElements.get(component_name)) {
        // component_constructor.base_url = this.components_path + component_name + '/'
        window.customElements.define(component_name, component_constructor)
      }
      this._components[component_name] = component_constructor
    } catch (err) {
      console.log(err)
    }
  }

}
