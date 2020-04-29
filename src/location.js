'use strict'

import Emitter from './emitter.js'

export default class Location {

  constructor () {
    this.events = new Emitter()
    this.on_change = this.on_change.bind(this)
  }

  start () {
    if (this._started) {
      return this
    }

    location.hash = location.hash || '#/'
    let url = location.pathname + location.hash

    this.on_change({ newURL: url })
    window.addEventListener('hashchange', this.on_change)

    this._started = true
    return this
  }

  stop () {
    window.removeEventListener('hashchange', this.on_change)
    this._started = false
    return this
  }

  on_change (event) {
    let url = event.newURL
    let path = url.substr(url.indexOf('#') + 1)

    this.events.emit('change', { path })
  }

}