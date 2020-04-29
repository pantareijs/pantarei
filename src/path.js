'use string'

export default class Path {

  static unslash (path) {
    if (!path) {
      return path
    }
    while (path.startsWith('/')) {
      path = path.slice(1)
    }
    while (path.endsWith('/')) {
      path = path.slice(0, -1)
    }
    return path
  }

  static split (path) {
    if (!path) {
      return []
    }
    path = this.unslash(path)
    if (!path) {
      return []
    }
    let parts = path.split('/')
    return parts
  }

  static join (...parts) {
    parts = parts.map(this.unslash)
    let path = parts.join('/')
    return path
  }

  static * subpaths (path) {
    let parts = this.split(path)
    let subpaths = []
    let subpath = ''
    for (let part of parts) {
      subpath += part
      subpaths.push(subpath)
      yield subpath
      subpath += '/'
    }
    return subpaths
  }

}