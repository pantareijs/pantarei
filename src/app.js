'use strict'

import Controller from './controller.js'
import Location from './location.js'
import Router from './router.js'
import Navigator from './navigator.js'
import Register from './register.js'
import Path from './path.js'

export default class App {

  static get defaults () {
    return {
      components_path: 'components/',
      container_name: 'app-container',
      controller_name: 'app-controller',
      router_name: 'app-router',
      root_id: 'root',
      navigate: false
    }
  }

  static async start (config) {
    let app = new App(config)
    await app.start()
    return app
  }

  constructor (config) {
    config = Object.assign(this.constructor.defaults, config)

    let root = config.root || document.getElementById(config.root_id)
    if (!root) {
      throw new Error('root is undefined')
    }
    if (!(root instanceof HTMLElement)) {
      throw new Error('root is not an HTML element')
    }
    this.root = root
    this.root.app = this

    let host = location.host
    let path_name = location.pathname.replace('index.html', '')

    let components_path = Path.join(host, path_name, config.components_path)
    this.components_path = components_path
    this.register = new Register({ components_path })

    this.container_name = config.container_name

    this.controller_name = config.controller_name
    this.controller_path = Path.join(this.components_path, this.controller_name, 'index.js')

    this.router_name = config.router_name
    this.router_path = Path.join(this.components_path, this.router_name, 'index.js')

    this.navigate = config.navigate

    this.components = {}
  }

  async start () {
    let controller_module = await import(this.controller_path)
    let Controller = controller_module.default
    this.controller = new Controller()

    let Container = await this.register.get_component(this.container_name)
    this.container = document.createElement(this.container_name)
    this.root.appendChild(this.container)

    this.controller.container = this.container

    this.root.addEventListener('action', this._on_action.bind(this), true)
    this.root.addEventListener('ready', this._on_ready_component.bind(this), true)

    if (this.navigate) {
      this.router = new Navigator()
    } else {
      let router_module = await import(this.router_path)
      let Router = router_module.default
      Router.base_url = this.router_path
      this.router = new Router()
    }

    let location = new Location()
    this.location = location

    this.location.events.on('change', this.on_change_location.bind(this))
    this.router.events.on('change', this.on_change_route.bind(this))

    await this.router.start()
    await this.location.start()
  }

  _on_ready_component (event) {
    let component = event.detail
    let components = component._components || []
    this.register.get_components(components)
  }

  _on_action (event) {
    let detail = event.detail
    this._action(detail)
  }

  async _action (detail) {
    let callback = detail.callback
    let name = detail.name
    let data = detail.data

    try {
      let res = await this.controller.action(name, data)
      callback(null, res)
    } catch (err) {
      callback(err, null)
    }
  }

  async on_change_location (context) {
    let path = context.path
    this.router.navigate(path)
  }

  async on_change_route (context) {
    let route = context.route
    let params = context.params
    let path = context.path

    if (this._current_path === path) {
      return
    }
    this._current_path = path

    this.container.clear()

    let component = route.component
    let component_name = route.component_name
    if (typeof component === 'string') {
      component_name = component
      await this.register.get_component(component_name)
    } else {
      await this.register.define_component(component_name, component)
    }

    let page = document.createElement(component_name)
    page.context = context

    this.container.attach(page)
  }

}
