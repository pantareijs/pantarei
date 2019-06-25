
export class Register {

  constructor (config) {
    this.components_path = config.components_path

    this._components = {}
    this._promises = {}
  }

  get_component_url (component_name) {
    return this.components_path + component_name + '/index.js'
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
    let component = this._components[component_name]
    if (component) {
      return component
    }

    try {
      let module_url = this.get_component_url(component_name)
      let module_obj = await import(module_url)
      component = module_obj.default
    } catch (error) {
      component = (class Component extends Pantarei.Component {})
    }

    this.define_component(component_name, component)
    return component
  }

  define_component (component_name, component) {
    try {
      if (!window.customElements.get(component_name)) {
        component.base_url = this.components_path + component_name + '/'
        window.customElements.define(component_name, component)
      }
      this._components[component_name] = component
    } catch (err) {
      console.log(err)
    }
  }

}
