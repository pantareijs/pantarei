
export class Route {

  constructor (route) {
    this.name = route.name
    this.param = route.param
    this.component = route.component
    this.data = route.data

    this.children = new Map()
    this.child = null

    if (route.routes) {
      this.add_routes(route.routes)
    }
  }

  add_routes (routes) {
    routes.forEach(this.add_route, this)
  }

  add_route (route) {
    let child = new Route(route)

    if (child.param) {
      this.child = child
      return
    }

    this.children.set(child.name, child)
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
    let params = context.params
    let breadcrumbs = context.breadcrumbs

    let segments = context.segments
    let segment = segments[0]

    if (!segment) {
      breadcrumbs.push(this)
      let route = this
      let matching = { path, params, breadcrumbs, route }
      return matching
    }

    let rest = segments.slice(1)

    let child = this.children.get(segment)
    if (child) {
      breadcrumbs.push(this)
      return child._match({ path, segments: rest, params, breadcrumbs })
    }

    child = this.child
    if (child) {
      params[child.param] = segment
      breadcrumbs.push(this)
      return child._match({ path, segments: rest, params, breadcrumbs })
    }

    let has_children = this.children.size === 0
    if (!has_children) {
      let route = this
      let matching = { path, params, breadcrumbs, route }
      return matching
    }

    let matching = { path, params, breadcrumbs, route: null }
    return matching
  }

}