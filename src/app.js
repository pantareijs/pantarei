'use strict'

import { Controller } from './controller.js'
import { Router } from './router.js'
import { Register } from './register.js'

export class App {

  static get defaults () {
    return {
      components_path: 'components/',
      container_name: 'app-container',
      controller_name: 'app-controller',
      root_id: 'root'
    }
  }

  constructor (config) {
    config = config || {}
    let defaults = this.constructor.defaults

    let root = config.root || document.getElementById(defaults.root_id)
    if (!root) {
      throw new Error('root is undefined')
    }
    if (!(root instanceof HTMLElement)) {
      throw new Error('root is not an HTML element')
    }
    this.root = root
    this.root.app = this

    let path_name = location.pathname

    let components_path = path_name + (config.components_path || defaults.components_path)
    this.register = new Register({ components_path })

    this.container_name = config.container_name || defaults.container_name
    this.container_path = components_path + this.container_name

    this.controller_name = config.controller_name || defaults.controller_name
    this.controller_path = components_path + this.controller_name

    this.router = config.router
    this.components = {}
  }

  async start () {
    let controller_module = await import(this.controller_path + '/index.js')
    let Controller = controller_module.default
    this.controller = new Controller()

    let Container = await this.register.get_component(this.container_name)
    this.container = document.createElement(this.container_name)
    this.root.appendChild(this.container)

    this.root.addEventListener('action', this._on_action.bind(this), true)
    this.root.addEventListener('connected', this._on_connect_component.bind(this), true)
    this.root.addEventListener('ready', this._on_ready_component.bind(this), true)
    this.root.addEventListener('disconnected', this._on_disconnect_component.bind(this), true)

    if (this.router) {
      this.router.events.on('change_route', this.on_change_route.bind(this))
      this.router.start()
    }

  }

  _on_ready_component (event) {
    let component = event.detail
    let components = component._components || []
    this.register.get_components(components)
  }

  _on_connect_component (event) {
    let component = event.detail
    let prop_name = component.constructor.consumers

    component[prop_name] = this.controller.data[prop_name]

    let listener = (prop) => {
      component[prop_name] = prop
    }
    let unsubscribe = this.controller.events.on(`dispatch ${prop_name}`, listener)
    component._unsubscribe = unsubscribe
  }

  _on_disconnect_component (component) {
    if (component._unsubscribe) {
      component._unsubscribe()
    }
  }

  _on_action (event) {
    let detail = event.detail
    let action = detail.name
    let handler = this.controller[action]

    if (!handler) {
      return
    }

    let callback = detail.callback
    let params = detail.data
    let caller = detail.component
    this._call_action(handler, params, caller, callback)
  }

  async _call_action (handler, params, caller, callback) {
    try {
      let res = await handler.call(this.controller, params, caller)
      callback(null, res)
    } catch (err) {
      callback(err, null)
    }
  }

  async on_change_route (context) {
    let route = context.route
    let params = context.params
    let path = context.path

    if (this._dest_path === path) {
      return
    }
    this._dest_path = path

    this.clear()

    let component_name = route.component
    let Component = await this.register.get_component(component_name)

    let page = document.createElement(component_name)
    page.context = context
    this.attach(page)
  }

  attach (page) {
    this.page = page
    this.controller.page = this.page

    if (this.controller.data) {
      this.controller.data.page = {}
    }

    this.container.page = this.page

    this.container.appendChild(this.page)

    requestAnimationFrame(this.scroll)
  }

  clear () {
    let container = this.container
    let child
    while (child = container.firstChild) {
      child.remove()
    }
  }

  scroll () {
    document.body.scrollTo(0, 0)
    window.scrollTo(0, 0)
  }

}
