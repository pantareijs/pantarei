'use strict'

import Type from '../type/index.js'

export default superclass => class extends superclass {

  static properties = []

  async init () {
    if (super.init) {
      super.init()
    }
    this.init_props()
  }

  init_props () {
    this.define_properties()
  }

  define_properties () {
    let properties = this.constructor.properties
    for (let property of properties) {
      this.define_property(property)
    }
  }

  define_property (property) {
    let name = property.name
    let value = property.value
    if (Type.function(value)) {
      value = value()
    }
    this.props = this.props || {}
    this.props[name] = this[name] || value

    let component = this
    Object.defineProperty(component, name, {

      get () {
        return component.props[name]
      },

      set (value) {
        component.props[name] = value
        component.render()
      }

    })
  }

}