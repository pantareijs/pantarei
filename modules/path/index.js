'use string'

export default class Path {

  static unslash (path) {
    if (!path) {
      return path
    }
    path = this.unslash_start(path)
    path = this.unslash_end(path)
    return path
  }

  static unslash_start (path) {
    while (path.startsWith('/')) {
      path = path.slice(1)
    }
    return path
  }

  static unslash_end (path) {
    while (path.endsWith('/')) {
      path = path.slice(0, -1)
    }
    return path
  }

  static split (path, separator='/') {
    if (!path) {
      return []
    }
    path = this.unslash(path)
    if (!path) {
      return []
    }
    let parts = path.split(separator)
    return parts
  }

  static normalize (path) {
    path = this.join([path])
    return path
  }

  static join (...paths) {
    let starting = ''
    let first_path = paths[0]

    let http = 'http://'
    let https = 'https://'
    let slash = '/'

    if (first_path.startsWith(http)) {
      first_path = first_path.slice(http.length)
      starting = http
    }
    else if (first_path.startsWith(https)) {
      first_path = first_path.slice(https.length)
      starting = https
    }
    else if (first_path.startsWith(slash)) {
      first_path = first_path.slice(slash.length)
      starting = slash
    }
    paths[0] = first_path

    let parts = []
    for (let path of paths) {
      let path_parts = path.split(slash)
      parts = parts.concat(path_parts)
    }

    let empty = ''
    let dot = '.'
    let dotdot = '..'

    let new_parts = []
    for (let part of parts) {
      if (part === empty) {
        continue
      }
      if (part === dot) {
        continue
      }
      if (part === dotdot) {
        new_parts.pop()
        continue
      }
      new_parts.push(part)
    }

    let path = starting + new_parts.join(slash)
    return path
  }

  static concat (...parts) {
    parts = parts.map(this.unslash_end, this)
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