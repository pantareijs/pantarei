'use strict'

export default class Renderer {

  get fps () { return 16 }

  get delay () { return 1000 / this.fps }

  constructor (component) {
    this.component = component
    this._render = this._render.bind(this)
    this.render = this._throttle(this._render, this.delay)
  }

  _render () {
    this.component._render()
  }

  _throttle (callback, wait, immediate = false) {
    let timeout = null
    let initial_call = true

    return function() {
      const call_now = immediate && initial_call
      const next = () => {
        callback.apply(this, arguments)
        timeout = null
      }

      if (call_now) {
        initial_call = false
        next()
      }

      if (!timeout) {
        timeout = setTimeout(next, wait)
      }
    }
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