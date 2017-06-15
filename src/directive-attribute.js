import { ExpressionPath } from './expression-path'

export class DirectiveAttribute {

  static get _prefix () { return 'attr-' }

  static match (attribute) {
    return attribute.name.startsWith(this._prefix)
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let name = attribute.name.substring(this._prefix.length)
    let expression = new ExpressionPath(attribute.value)
    let directive = new this({ name, expression })
    return directive
  }

  constructor (options) {
    this._name = options.name
    this._expression = options.expression
  }

  run (node, context) {
    let value = this._expression.evaluate(context)
    node.setAttribute(this._name, value)
  }

}