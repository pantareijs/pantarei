'use strict'

export default class Expression {

  constructor (expression) {
    this.expression = expression

    let parts = expression.split('.')
    let n = parts.length

    if (n == 1) {
      this.eval = (object) => {
        return object[expression]
      }
    }

    this.eval = (value) => {
      let i = 0
      while (i < n && value) {
        let part = parts[i]
        value = value[part]
        i += 1
      }
      return value
    }
  }

  eval () {}

}