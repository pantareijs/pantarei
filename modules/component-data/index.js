'use strict'

export default superclass => class extends superclass {

  async init () {
    super.init()
    this.data = this.data || {}

    await this.locks.unlocked('render')
    let data = this.data

    this.__data = {}
    this.data = this.create_proxy(this.__data, this.render)

    Object.assign(this.data, data)

    this.locks.unlock('data')
  }

  create_proxy (target, render) {
    return new Proxy(target, {

      set (target, key, value) {
        target[key] = value
        render()
        return true
      },

      get (target, key) {
        return target[key]
      }

    })
  }

}