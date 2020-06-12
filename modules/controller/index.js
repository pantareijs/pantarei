'use strict'

import Emitter from '../emitter/index.js'

export default class Controller {

  constructor () {
    this.events = new Emitter()
  }

  use (actions) {
    for (let name in actions) {
      this[name] = actions[name]
    }
    return this
  }

  async action (name, ...args) {
    let handler = this[name]
    if (!handler) {
      return
    }
    let res = await handler.apply(this, args)
    return res
  }

}