import { ExpressionPath } from './expression-path'

export class DirectiveText {

  static match (attribute) {
    return attribute.name === 'text'
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let value_expression = new ExpressionPath(attribute.value)
    let directive = new this({ name, value_expression })
    return directive
  }

  constructor (options) {
    this.value_expression = options.value_expression
  }

  run (node, context) {
    let value = this.value_expression.evaluate(context)
    node.innerText = value
  }

}