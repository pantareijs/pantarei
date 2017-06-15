import { ExpressionPath } from './expression-path'

export class DirectiveProperty {

  static get _prefix () { return 'prop-' }

  static match (attribute) {
    return attribute.name.startsWith(this._prefix)
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let property_name = attribute.name.substring(this._prefix.length)
    let property_expression = new ExpressionPath(attribute.value)
    let directive = new this({ property_name, property_expression })
    return directive
  }

  constructor (options) {
    this.property_name = options.property_name
    this.property_expression = options.property_expression
  }

  run (node, context) {
    let value = this.property_expression.evaluate(context)
    node[this.property_name] = value
  }

}