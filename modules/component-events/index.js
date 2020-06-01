'use strict'

import Lock from '../lock/index.js'

export default superclass => class extends superclass {

  async init () {
    if (super.init) {
      super.init()
    }
    this.lock_events = new Lock()
    await this.init_events()
  }

  async init_events () {
    this.lock_events.unlock()
  }

  emit (type, detail) {
    detail = detail || {}
    let config = {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail
    }
    let event = new CustomEvent(type, config)
    this.dispatchEvent(event)
  }

  action (name, ...args) {
    return new Promise((resolve, reject) => {
      let callback = (error, result) => {
        if (error) {
          reject(error)
          return
        }
        resolve(result)
      }

      this.emit('action', { name, args, callback })
    })
  }

}