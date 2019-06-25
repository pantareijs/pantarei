'use strict'

export class Renderer {

  constructor (component) {
    this.component = component
    this._render = this._render.bind(this)
    this.render = this._debounce(this._render, 1000 / 16)
  }

  _render () {
    this.component._render()
  }

  _debounce (func, wait) {
    wait = wait || 0
    let timeout
    let waiting = false

    let wrapper = () => {
      waiting = false
      func.call(this)
      clearTimeout(timeout)
    }

    let debounced = () => {
      if (waiting) {
        return
      }
      waiting = true
      timeout = setTimeout(wrapper, wait)
    }

    return debounced
  }

}