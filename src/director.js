export class Director {

  constructor () {
    this.directives = []
  }

  parse (node) {
    node._directed_nodes = node._directed_nodes || []
    this._parse_directed_nodes(node)
  }

  _parse_directed_nodes (node) {
    let walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT)
    while (walker.nextNode()) {
      let directed_node = walker.currentNode
      this._parse_directed_node(node, directed_node)
    }
  }

  _parse_directed_node (node, directed_node) {
    this._parse_node_attributes(directed_node)
    if (directed_node._directives.length > 0) {
      if (!node._directed_nodes.includes(directed_node)) {
        node._directed_nodes.push(directed_node)
        directed_node._director = node
      }
    }
  }

  _parse_node_attributes (node) {
    node._directives = node._directives || []
    for (let attribute of node.attributes) {
      this._parse_node_attribute(node, attribute)
    }
  }

  _parse_node_attribute (node, attribute) {
    let directive_constructors = this.constructor.directives
    for (let directive_constructor of directive_constructors) {
      let directive = directive_constructor.parse(node, attribute)
      if (directive) {
        node._directives.push(directive)
      }
    }
  }

  render (node, context) {
    context = context || node
    for (let directed_node of node._directed_nodes) {
      for (let directive of directed_node._directives) {
        directive.run(directed_node, context)
      }
    }
  }

}