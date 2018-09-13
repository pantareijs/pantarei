'use strict'

import { Director } from './director'
import { DirectiveAttribute } from './directives/attribute'
import { DirectiveClassName } from './directives/classname'
import { DirectiveEvent } from './directives/event'
import { DirectiveProperty } from './directives/property'
import { DirectiveRepeat } from './directives/repeat'
import { DirectiveText } from './directives/text'
import { Component } from './component'

export class Pantarei {

  static get version () { return '4.0.0' }

  static get directives () {
    return [
      DirectiveAttribute,
      DirectiveClassName,
      DirectiveEvent,
      DirectiveProperty,
      DirectiveRepeat,
      DirectiveText
    ]
  }

  constructor (options) {
    if (!options) {
      throw new Error('argument is missing')
    }
    if (!options.el) {
      throw new Error('el is missing')
    }
    if (!(options.el instanceof HTMLElement)) {
      throw new Error('el is not an instance of HTMLElement')
    }
    this._root = options.el
    Director.directives = this.constructor.directives
    this._director = new Director(this._root)
    this._director.parse(this._root)

    if (!options.data) {
      options.data = {}
    }
    if (typeof options.data !== 'object') {
      throw new Error('data is not an object')
    }

    this._debounced_update = this.debounce(this._update, 16)

    this._data = {}
    this.data = {}
    this._watch(options.data)

    this._debounced_update()
  }

  _watch (data) {
    for (let name in data) {
      let value = data[name]
      this._watch_property(name, value)
    }
  }

  _watch_property (name, value) {
    let self = this

    self._data[name] = value

    Object.defineProperty(self.data, name, {
      get () {
        return self._data[name]
      },
      set (value) {
        if (self._data[name] === value) {
          return
        }
        self._data[name] = value
        self._debounced_update()
      }
    })
  }

  _update () {
    this._director.render(this._root, this.data, this)
  }

  debounce (func, wait) {
    wait = wait || 0
    let waiting = false
    let invoked = () => {
      waiting = false
      func.call(this)
    }
    let debounced = () => {
      if (waiting) {
        return
      }
      waiting = true
      setTimeout(invoked, wait)
    }
    return debounced
  }

}

Pantarei.Component = Component