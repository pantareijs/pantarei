'use strict'

import Emitter from './emitter.js'

export default class Controller {

  constructor () {
    this.events = new Emitter()
  }

  use (actions) {
    for (let name of actions) {
      this[name] = actions[name]
    }
    return this
  }

  async action (name, data) {
    let handler = this[name]
    if (!handler) {
      return
    }
    let res = await handler.call(this, data)
    return res
  }

}