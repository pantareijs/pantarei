'use strict'

import Lock from '../lock/index.js'

export default superclass => class extends superclass {

  async init () {
    if (super.init) {
      super.init()
    }
    this.lock_data = new Lock()
    await this.lock_render.unlocked
    await this.init_data()
  }

  async init_data () {
    let data = this.data || {}
    this._data = Object.assign({}, data)
    this.data = this.create_proxy(this._data, this.render)
    this.lock_data.unlock()
  }

  create_proxy (target, update) {
    return new Proxy(target, {

      set (target, key, value) {
        target[key] = value
        update.call(this)
        return true
      },

      get (target, key) {
        return target[key]
      }

    })
  }

}