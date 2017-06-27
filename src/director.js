export class Director {

  constructor (root_node) {
    this.root_node = root_node
  }

  parse (node) {
    this.root_node = this.root_node || node
    node._directed_nodes = node._directed_nodes || []
    this._parse_node_directives(node)
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
    this._parse_node_directives(directed_node)
    if (directed_node._directives.length > 0) {
      if (!node._directed_nodes.includes(directed_node)) {
        node._directed_nodes.push(directed_node)
        directed_node._director = node
      }
    }
  }

  _parse_node_directives (node) {
    node._directives = node._directives || []
    node._root_node = this.root_node
    if (!node.attributes) {
      return
    }
    for (let attribute of Array.from(node.attributes)) {
      this._parse_node_directive(node, attribute)
    }
  }

  _parse_node_directive (node, attribute) {
    let directive_constructors = this.constructor.directives
    for (let directive_constructor of directive_constructors) {
      let directive = directive_constructor.parse(node, attribute)
      if (directive) {
        node._directives.push(directive)
      }
    }
  }

  _run_directives (node, data, context) {
    for (let directive of node._directives) {
      directive.run(node, data, context)
    }
  }

  render (node, data, context) {
    data = data || node
    context = context || node
    node._context = context
    this._run_directives(node, data, context)

    for (let directed_node of node._directed_nodes) {
      this._run_directives(directed_node, data, context)
    }
  }

}