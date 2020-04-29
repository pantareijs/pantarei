'use strict'

import Route from './route.js'
import Emitter from './emitter.js'

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
    let base_url = this.base_url
    let routes_url = base_url + '/' + this.routes_url
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

    let root = routes.find(route => route.home)
    if (!root) {
      root = routes.find(route => route.name === 'home')
    }
    if (!root) {
      root = routes[0]
    }
    let children = routes.filter(route => route != root)
    root.routes = children

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