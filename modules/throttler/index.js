'use strict'

export default class Throttler {

  static throttle (callback, wait=1000/16, immediate=false) {
    let timeout = null
    let initial_call = true

    return function () {
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

}