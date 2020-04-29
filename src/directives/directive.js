'use strict'

export default class Directive {

  static get type () {
    throw new Error('static property `type` must be overridden')
  }

  static match (attribute) {
    throw new Error('static method `match` must be overridden')
  }

  static parse (node, attribute) {
    throw new Error('static method `parse` must be overridden')
  }

  run (data) {
    throw new Error('instance method `run` must be overridden')
  }

}
