'use strict'

import Location from '../location/index.js'
import Router from '../router/index.js'
import Path from '../path/index.js'

export default superclass => class extends superclass {

  static get config () {
    return {
      ...super.config,
      router_name: 'app-router'
    }
  }

  async start () {
    super.start()

    let config = this.constructor.config
    let base_url = this.base_url

    let components_path = config.components_path
    let router_name = config.router_name
    let router_path = Path.join(base_url, components_path, router_name, 'index.js')

    let router_module
    let router_constructor
    try {
      router_module = await import(router_path)
      router_constructor = router_module.default
    } catch (err) {
      router_constructor = Router
    }

    let router = new router_constructor()
    this.router = router

    let location = new Location()
    this.location = location

    this.location.events.on('change', this.on_change_location.bind(this))
    this.router.events.on('change', this.on_change_route.bind(this))

    await this.router.start()
    await this.location.start()
  }

  async on_change_location (context) {
    let path = context.path
    this.router.navigate(path)
  }

  async on_change_route (context) {
    let path = context.path

    if (this._current_path === path) {
      this._current_page.context = context
      return
    }

    this.container.clear()

    let route = context.route
    let component_name = route.component

    if (typeof component_name === 'string') {
      await this.register.get_component(component_name)
    }

    let page = document.createElement(component_name)
    page.context = context

    this._current_path = path
    this._current_page = page
    this.container.attach(page)
  }

}
