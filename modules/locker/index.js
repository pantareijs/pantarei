'use strict'

import Lock from '../lock/index.js'

export default class Locker {

  constructor () {
    this.locks = new Map()
  }

  lock (name) {
    if (Array.isArray(name)) {
      return this.lock_all(name)
    }
    let locks = this.locks
    let lock = locks.get(name)
    if (!lock) {
      lock = new Lock()
      locks.set(name, lock)
    }
    return lock
  }

  lock_all (names) {
    let locks = names.map(this.lock, this)
    return locks
  }

  unlock (name) {
    if (Array.isArray(name)) {
      this.unlock_all(name)
      return
    }
    let lock = this.lock(name)
    lock.unlock()
  }

  unlock_all (names) {
    names.forEach(this.unlock, this)
  }

  unlocked (name) {
    if (Array.isArray(name)) {
      return this.unlocked_all(name)
    }
    let lock = this.lock(name)
    return lock.unlocked
  }

  unlocked_all (names) {
    let unlocked = names.map(this.unlocked, this)
    return Promise.allSettled(unlocked)
  }

}