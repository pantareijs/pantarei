'use strict'

export class Route {

  constructor (config) {
    this.name = config.name
    this.param = config.param
    this.component = config.component
    this.data = config.data

    this.routes = new Map()
    this.route = null

    if (config.routes) {
      this.add_routes(config.routes)
    }
  }

  add_routes (configs) {
    for (let config of configs) {
      this.add_route(config)
    }
  }

  add_route (config) {
    let route = new Route(config)

    if (route.param) {
      this.route = route
      return
    }

    this.routes.set(route.name, route)
  }

  match (path) {
    if (path.startsWith('/')) {
      path = path.substring(1, path.length)
    }
    if (path.endsWith('/')) {
      path = path.substring(0, path.length - 1)
    }
    let segments = path.split('/')
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

    let next_route = this.routes.get(segment)
    if (next_route) {
      breadcrumbs.push(this)
      return next_route._match({ path, segments, params, breadcrumbs })
    }

    next_route = this.route
    if (next_route) {
      breadcrumbs.push(this)
      let param = next_route.param
      params[param] = segment
      return next_route._match({ path, segments, params, breadcrumbs })
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