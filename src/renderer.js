'use strict'

export class Renderer {

  get fps () { return 16 }

  get delay () { return 1000 / this.fps }

  constructor (component) {
    this.component = component
    this._render = this._render.bind(this)
    this.render = this._debounce(this._render, this.delay)
  }

  _render () {
    this.component._render()
  }

  _debounce (func, wait) {
    let timeout

    let debounced = function () {
      let context = this

      let later = function () {
        func.apply(context)
      }

      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }

    return debounced
  }

}