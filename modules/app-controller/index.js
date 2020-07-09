'use strict'

import Controller from '../controller/index.js'
import Lock from '../lock/index.js'
import Path from '../path/index.js'

export default superclass => class extends superclass {

  static get config () {
    return {
      ...super.config,
      controller_name: 'app-controller'
    }
  }

  async start () {
    super.start()

    this._controller_lock = new Lock()

    this.root.addEventListener('action', this.on_component_action.bind(this), true)

    let config = this.constructor.config
    let base_url = this.base_url

    let components_path = config.components_path
    let controller_name = config.controller_name
    let controller_path = Path.join(base_url, components_path, controller_name, 'index.js')

    let controller_module
    let controller_constructor
    try {
      controller_module = await import(controller_path)
      controller_constructor = controller_module.default
    } catch (err) {
      controller_constructor = Controller
    }
    let controller = new controller_constructor()

    this.controller = controller

    this._controller_lock.unlock()
  }

  async on_component_action (event) {
    let detail = event.detail
    let callback = detail.callback
    let name = detail.name
    let args = detail.args || []

    await this._controller_lock.unlocked

    try {
      let res = await this.controller.action(name, ...args)
      callback(null, res)
    } catch (err) {
      callback(err, null)
    }
  }

}
