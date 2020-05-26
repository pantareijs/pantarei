'use strict'

import Path from '../path/index.js'

export default class Route {

  constructor (config) {
    this.name = config.name
    this.param = config.param
    this.component = config.component
    this.data = config.data

    this.routes = new Map()
    this.dynamic_route = null

    if (config.routes) {
      this.add_routes(config.routes)
    }
  }

  add_routes (routes) {
    for (let route of routes) {
      this.add_route(route)
    }
  }

  add_route (route) {
    route = new this.constructor(route)

    let has_param = route.param
    if (has_param) {
      this.dynamic_route = route
      return
    }

    this.routes.set(route.name, route)
  }

  match (path) {
    let segments = Path.split(path)
    let params = {}
    let breadcrumbs = []

    let matching = this._match({ path, segments, params, breadcrumbs })

    return matching
  }

  _match (context) {
    let path = context.path
    let segments = context.segments
    let params = context.params
    let breadcrumbs = context.breadcrumbs

    if (!segments.length) {
      breadcrumbs.push(this)
      let route = this
      let matching = { path, params, breadcrumbs, route }
      return matching
    }

    let segment = segments.shift(1)

    let next_route

    next_route = this.routes.get(segment)
    if (next_route) {
      breadcrumbs.push(this)
      let matching = next_route._match({ path, segments, params, breadcrumbs })
      return matching
    }

    next_route = this.dynamic_route
    if (next_route) {
      breadcrumbs.push(this)
      let param = next_route.param
      params[param] = segment
      let matching = next_route._match({ path, segments, params, breadcrumbs })
      return matching
    }

    let has_no_routes = this.routes.size === 0
    if (has_no_routes) {
      breadcrumbs.push(this)
      let route = this
      let matching = { path, params, breadcrumbs, route }
      return matching
    }

    let matching = { path, params, breadcrumbs, route: null }
    return matching
  }

}