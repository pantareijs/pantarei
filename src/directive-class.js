import { ExpressionPath } from './expression-path'

export class DirectiveClass {

  static get type () { return 'class' }

  static get _prefix () { return 'class.' }

  static match (attribute) {
    return attribute.name.startsWith(this._prefix)
  }

  static parse_name (attribute) {
    return attribute.name.substring(this._prefix.length)
  }

  static parse_value (attribute) {
    return attribute.value
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }
    if (!node.classList) {
      return
    }

    let name = this.parse_name(attribute)
    let value = this.parse_value(attribute)
    let expression = new ExpressionPath(value)
    let directive = new this({ node, name, expression })
    return directive
  }

  constructor (options) {
    this.node = options.node
    this.name = options.name
    this.expression = options.expression
  }

  run (node, context) {
    let value = this.expression.evaluate(context)
    node.classList.toggle(this.name, !!value)
  }

}