'use strict'

export default class Lock {

  get unlocked () {
    return this.promise
  }

  constructor () {
    this.promise = null
    this.resolve = null
    this.lock()
  }

  lock () {
    if (this.promise) {
      return
    }
    this.promise = new Promise((resolve) => {
      this.resolve = resolve
    })
  }

  unlock () {
    this.resolve()
    this.promise = null
    this.resolve = null
  }

}