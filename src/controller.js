'use strict'

import { Emitter } from './emitter.js'

export class Controller {

  constructor () {
    this.events = new Emitter()
    this.data = {}
  }

  dispatch (props) {
    this.events.emit('dispatch', props)
    for (let prop_name in props) {
      let prop = props[prop_name]
      this.events.emit(`dispatch ${prop_name}`, prop)
    }
  }

  update (data) {
    Object.assign(this.data, data)

    if (this.container && this.container.data) {
      Object.assign(this.container.data, this.data)
    }

    if (this.page && this.page.data) {
      Object.assign(this.page.data, this.data)
    }
  }

}