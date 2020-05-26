'use strict'

import Emitter from '../emitter/index.js'
import Path from '../path/index.js'
import Route from '../route/index.js'

export default class Router {

  static get default_routes () {
    return [
      {
        "home": true,
        "component": "page-home"
      }
    ]
  }

  static get routes () { return undefined }

  static get routes_url () { return 'routes.json' }

  static get _routes () {
    if (!this._promise_routes) {
      this._promise_routes = this._prepare_routes()
    }
    return this._promise_routes
  }

  static async _prepare_routes () {
    let routes = this.routes
    if (routes) {
      return routes
    }

    routes = await this._fetch_routes()
    return routes
  }

  static async _fetch_routes () {
    let base_url = this.base_url.replace('index.js', '')
    let routes_url = Path.join(base_url, this.routes_url)
    try {
      let res = await fetch(routes_url)
      let routes = await res.json()
      return routes
    } catch (err) {
      console.warn(err)
      return ''
    }
  }

  constructor () {
    this.events = new Emitter()
  }

  async start () {
    let routes = await this.constructor._routes

    let root
    if (Array.isArray(routes)) {
      let is_root = (route) => { return route.home || route.name === 'home' }
      root = routes.find(is_root) || routes[0]
      let children = routes.filter(route => route != root)
      root.routes = children
    } else {
      root = routes
    }

    this.root = new Route(root)
  }

  navigate (path) {
    let matching = this.root.match(path)

    if (!matching.route) {
      return
    }

    this.events.emit('change', matching)
  }

}