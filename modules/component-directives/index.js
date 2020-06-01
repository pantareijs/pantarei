'use strict'

import Path from '../path/index.js'

export default superclass => class extends superclass {

  static directives = null

  static directives_url = 'directives.json'

  static get_directives () {
    if (!this._promise_directives) {
      this._promise_directives = this._prepare_directives()
    }
    return this._promise_directives
  }

  static _prepare_directives () {
    let directives = this.directives
    if (directives) {
      return Promise.resolve(directives)
    }
    let promise_directives = this._fetch_directives()
    return promise_directives
  }

  static async _fetch_directives () {
    let directives = {}
    let base_url = this.base_url.replace('/index.js', '/')
    let directives_url = Path.join(base_url, this.directives_url)

    try {
      let res = await fetch(directives_url)
      directives = await res.json()
    } catch (err) {
      console.warn(err)
    }

    return directives
  }

  async init () {
    if (super.init) {
      super.init()
    }
    await this.lock_content.unlocked
    await this.init_directives()
  }

  async init_directives () {
    if (!this.constructor.experiments) {
      return
    }
    if (!this.constructor.experiments.directives) {
      return
    }
    let directives_map = await this.constructor.get_directives()
    this.bind_directives_map(this.shadowRoot, directives_map)
  }

  bind_directives_map (node, directives_map) {
    let selectors = Object.keys(directives_map)
    for (let selector of selectors) {
      let selected = node.querySelector(selector)
      let directives = directives_map[selector]
      this.bind_directives(selected, directives)
    }
  }

  bind_directives (node, directives) {
    for (let key in directives) {
      let value = directives[key]
      node.setAttribute(key, value)
    }
  }

}