'use strict'

export default superclass => class extends superclass {

  async init () {
    super.init()
    await this.locks.unlocked('render')
    let data = this.data || {}
    this._data = Object.assign({}, data)
    this.data = this.create_proxy(this._data, this.render)
    this.locks.unlock('data')
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