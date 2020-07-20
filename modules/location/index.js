'use strict'

import Emitter from '../emitter/index.js'

export default class Location {

  constructor () {
    this.events = new Emitter()
    this.on_change = this.on_change.bind(this)
  }

  async start () {
    if (this._started) {
      return this
    }

    let hash = location.hash || '#/'
    let url = location.origin + location.pathname + hash
    this.on_change({ newURL: url })

    window.addEventListener('hashchange', this.on_change)

    this._started = true
  }

  stop () {
    window.removeEventListener('hashchange', this.on_change)

    this._started = false
  }

  on_change (event) {
    let url = event.newURL
    let path = url.substr(url.indexOf('#') + 1)

    this.events.emit('change', { path })
  }

}