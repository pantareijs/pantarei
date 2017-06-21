import { ExpressionPath } from './expression-path'

export class DirectiveText {

  static get type () { return 'text' }

  static match (attribute) {
    return attribute.name === 'text'
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let expression = new ExpressionPath(attribute.value)
    let directive = new this({ node, expression })
    return directive
  }

  constructor (options) {
    this.node = options.node
    this.expression = options.expression
  }

  run (node, data) {
    let value = this.expression.evaluate(data)
    node.innerText = value
  }

}