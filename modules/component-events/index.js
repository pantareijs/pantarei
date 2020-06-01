'use strict'

export default superclass => class extends superclass {

  async init () {
    super.init()
    this.locks.unlock('events')
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