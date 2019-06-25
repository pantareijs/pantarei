import { Route } from './route.js'
import { Emitter } from './emitter.js'

export class Router {

  constructor (config) {
    this.routes = []
    let routes = config.routes || []

    this._add_routes(routes)

    this.events = new Emitter()
    this._on_hashchange = this._on_hashchange.bind(this)
  }

  _add_routes (routes) {
    if (!routes) {
      return
    }
    if (routes === null) {
      return
    }

    let route = routes[0]
    if (!route) {
      return
    }

    this.root_node = new Route(route)
    this.root_node.add_routes(route.routes)
  }

  start () {
    if (this._started) {
      return this
    }

    location.hash = location.hash || '#/'
    let url = location.pathname + location.hash

    this._on_hashchange({ newURL: url })
    window.addEventListener('hashchange', this._on_hashchange)

    this._started = true
    return this
  }

  stop () {
    window.removeEventListener('hashchange', this._on_hashchange)
    this._started = false
    return this
  }

  _on_hashchange (event) {
    let url = event.newURL
    let path = url.substr(url.indexOf('#') + 1)

    let matching = this.root_node.match(path)

    if (matching.route) {
      this.events.emit('change_route', matching)
    }
  }

}