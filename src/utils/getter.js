'use strict'

export function getter (path) {
  let parts = path.split('.')
  let n = parts.length

  if (n == 1) {
    return (object) => {
      return object[path]
    }
  }

  return (value) => {
    let i = 0
    while (i < n && value) {
      let part = parts[i]
      value = value[part]
      i += 1
    }
    return value
  }

}