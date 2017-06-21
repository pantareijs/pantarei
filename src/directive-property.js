import { ExpressionPath } from './expression-path'

export class DirectiveProperty {

  static get type () { return 'property' }

  static get _prefix () { return 'prop.' }

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

    if (this.name === 'checked' && node.nodeName === 'INPUT') {
      node.checked = !!value
      return
    }
    if (this.name === 'focus' && node.nodeName === 'INPUT') {
      if (!!value) {
        node.focus()
      }
      return
    }

    node[this.name] = value
  }

}