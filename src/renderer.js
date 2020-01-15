'use strict'

export class Renderer {

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
    let initialCall = true

    return function() {
      const callNow = immediate && initialCall
      const next = () => {
        callback.apply(this, arguments)
        timeout = null
      }

      if (callNow) {
        initialCall = false
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