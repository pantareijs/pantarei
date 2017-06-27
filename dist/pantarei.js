class Director {

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

class ExpressionPath {

  constructor (path) {
    let parts = path.split('.')
    let n = parts.length

    if (n == 1) {
      this.evaluator = (value) => {
        return value[path]
      }
      return
    }

    this.evaluator = (value) => {
      for (let i = 0; i < n && value; i++) {
        let part = parts[i]
        value = value[part]
      }
      return value
    }
  }

  evaluate (context) {
    return this.evaluator(context)
  }

}

class DirectiveAttribute {

  static get type () { return 'attribute' }

  static get _prefix () { return 'attr.' }

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
    node.setAttribute(this.name, value)
  }

}

class DirectiveClass {

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

class DirectiveEvent {

  static get type () { return 'event' }

  static get _prefix () { return 'ev.' }

  static match (attribute) {
    return attribute.name.startsWith(this._prefix)
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let event_name = attribute.name.substring(this._prefix.length)
    let event_expression = new ExpressionPath(attribute.value)

    let directive = new this({ node, event_name, event_expression })
    return directive
  }

  constructor (options) {
    let node = this.node = options.node
    let root_node = this.root_node = node._root_node
    let event_name = this.event_name = options.event_name
    let event_expression = this.event_expression = options.event_expression

    let unbubbled = ['focus', 'blur']
    if (node.nodeName === 'INPUT' && unbubbled.includes(event_name)) {
      let postfix = '-bubble'
      let custom_event_name = event_name + postfix
      node.addEventListener(event_name, (event) => {
        let config = { bubbles: true, cancelable: true, detail: event }
        let custom_event = new CustomEvent(custom_event_name, config)
        node.dispatchEvent(custom_event)
      })
      event_name = this.event_name = custom_event_name
    }

    this._on_event = this._on_event.bind(this)
    root_node._listening = root_node._listening || {}
    if (!root_node._listening[event_name]) {
      root_node.addEventListener(event_name, this._on_event, false)
      root_node._listening[event_name] = true
    }
  }

  run (node, data, context) {
    node._listeners = node._listeners || {}
    let handler = this.root_node.host ? this.root_node.host : context
    let event_listener = this.event_expression.evaluate(handler)
    node._listeners[this.event_name] = event_listener
  }

  _on_event (event) {
    let root_node = this.root_node

    let target = event.target
    let event_type = event.type

    let bubble = true
    let stop = event.stopPropagation

    event.stopPropagation = function () {
      stop.call(event)
      bubble = false
    }

    while (bubble) {
      let listeners = target._listeners
      if (listeners) {
        let listener = listeners[event_type]
        if (listener) {
          requestAnimationFrame(() => {
            let node = target.host ? target.host : root_node._context
            listener.call(node, event, event.detail)
          })
        }
      }

      if (!bubble) {
        break
      }

      target = target.parentNode
      if (!target) {
        break
      }
      if (target === root_node) {
        break
      }
    }
  }

}

class DirectiveProperty {

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

class DirectiveRepeat {

  static get type () { return 'repeat' }

  static get items_name () { return 'items' }

  static get item_name () { return 'item' }

  static get index_name () { return 'index' }

  static match (attribute) {
    return attribute.name === 'repeat'
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }
    if (node.nodeName.toLowerCase() !== 'template') {
      return
    }

    let content = node.content.children[0]
    let director_node = document.importNode(content, true)
    let items_name = node.getAttribute('repeat') || this.items_name
    let item_name = node.getAttribute('item') || this.item_name
    let index_name = node.getAttribute('index') || this.index_name
    let items_expression = new ExpressionPath(items_name)

    let directive = new this({ node, items_expression, item_name, index_name, director_node })
    return directive
  }

  constructor (options) {
    this.node = options.node
    this.items_expression = options.items_expression
    this.item_name = options.item_name
    this.index_name = options.index_name
    this.director_node = options.director_node
    this.director = new Director(this.node._root_node)
  }

  _create_director_node (node, index) {
    let new_director_node = this.director_node.cloneNode(true)
    this.director.parse(new_director_node)
    node._director_nodes[index] = new_director_node
    return new_director_node
  }

  _remove_director_node (node, index) {
    let director_node = node._director_nodes[index]
    if (!director_node) {
      return
    }
    director_node.remove()
    node._director_nodes[index] = null
  }

  _render_director_node (node, index, data, context) {
    let director_node = node._director_nodes[index]
    if (!director_node) {
      return
    }
    let new_data = Object.assign({}, data)
    let item = node._new_items[index]
    new_data[this.item_name] = item
    new_data[this.index_name] = index

    let detail = { index: index, data: new_data, node: director_node }
    let config = { bubbles: true, cancelable: true, detail: detail }
    let event = new CustomEvent('render', config)
    node.dispatchEvent(event)

    this.director.render(director_node, new_data, context)
  }

  run (node, data, context) {
    node._director_nodes = node._director_nodes || []
    node._items = node._items || []
    node._new_items = this.items_expression.evaluate(data) || []

    let items_count = node._items.length
    let new_items_count = node._new_items.length

    if (new_items_count < items_count) {
      for (let index = 0; index < new_items_count; index++) {
        this._render_director_node(node, index, data, context)
      }
      for (let index = new_items_count; index < items_count; index++) {
        this._remove_director_node(node, index)
      }
    }
    else {
      for (let index = 0; index < items_count; index++) {
        this._render_director_node(node, index, data, context)
      }
      let fragment = document.createDocumentFragment()
      for (let index = items_count; index < new_items_count; index++) {
        let director_node = this._create_director_node(node, index)
        this._render_director_node(node, index, data, context)
        fragment.appendChild(director_node)
      }
      node.parentNode.insertBefore(fragment, node)
    }

    node._items = node._new_items.slice()
  }

}

class DirectiveText {

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

class PromiseRegister {

  constructor () {
    this.prepared = {}
    this.resolved = {}
  }

  prepare (name) {
    if (this.prepared[name]) {
      return
    }

    this.prepared[name] = new Promise((resolve, reject) => {
      this.resolved[name] = resolve
    })
  }

  retrieve (name) {
    this.prepare(name)
    return this.prepared[name]
  }

  register (name, item) {
    this.prepare(name)
    this.resolved[name](item)
  }

  unregister (name) {
    delete this.prepared[name]
  }

  contains (name) {
    return this.prepared[name]
  }

}

const register = new PromiseRegister()

class TemplateElement extends HTMLElement {

  static get is () { return 'template-element' }

  static get register () { return register }

  constructor () {
    super()
    this._observer = new MutationObserver(this._register.bind(this))
    this._observer.observe(this, { childList: true })
    this._register()
  }

  _register () {
    if (this._registered) {
      this._observer.disconnect()
      return
    }
    let template = this.querySelector('template')
    if (!template) {
      return
    }
    let name = this.id
    if (!name) {
      return
    }
    if (window.ShadyCSS) {
      ShadyCSS.prepareTemplate(template, name)
    }
    register.register(name, template)
    this._registered = true
  }

}

customElements.define(TemplateElement.is, TemplateElement)

class Element extends HTMLElement {

  static get is () { throw new Error('static getter `is` must be overridden') }

  static get props () { return {} }

  static get render_delay () { return 16 }

  static template () { return TemplateElement.register.retrieve(this.is) }

  constructor () {
    super()
    this._init()
  }

  connectedCallback () {
    if (window.ShadyCSS) {
      ShadyCSS.styleElement(this)
    }
  }

  define_properties (descriptors) {
    for (let name in descriptors) {
      let descriptor = descriptors[name]
      this.define_property(name, descriptor)
    }
  }

  define_property (name, descriptor) {
    let value = descriptor.value
    if (typeof value === 'function') {
      value = value()
    }
    this._properties = this._properties || {}
    this._properties[name] = value || this[name]

    Object.defineProperty(this, name, {
      get () {
        return this._properties[name]
      },
      set (value) {
        if (this._properties[name] === value) {
          return
        }
        this._properties[name] = value
        this._debounced_render()
      }
    })
  }

  fire (type, detail) {
    let config = { bubbles: true, cancelable: true, composed: true, detail: detail }
    let event = new CustomEvent(type, config)
    this.dispatchEvent(event)
    return this
  }

  action (name, data) {
    this.fire('action', { name: name, data: data })
    return this
  }

  async (func) {
    requestAnimationFrame(func.bind(this))
  }

  debounce (func, wait) {
    wait = wait || 0
    let waiting = false
    let invoked = () => {
      waiting = false
      func.call(this)
    }
    let debounced = () => {
      if (waiting) {
        return
      }
      waiting = true
      setTimeout(invoked, wait)
    }
    return debounced
  }

  ready () {}

  render () {}

  _init () {
    this._init_render()
    this._init_props()
    this._init_content().then(() => {
      this._init_refs()
      this._parse(this.shadowRoot)
      this.ready()
      this._render()
    })
  }

  _init_render () {
    this._render = this._render.bind(this)
    this._debounced_render = this.debounce(this._render, this.constructor.render_delay)
  }

  _init_props () {
    this.define_properties(this.constructor.props)
  }

  _init_content () {
    this.attachShadow({ mode: 'open' })
    return this.constructor.template().then((template) => {
      let content = template.content
      let node = document.importNode(content, true)
      this.shadowRoot.appendChild(node)
    }).catch((err) => {
      console.warn(err)
    })
  }

  _init_refs () {
    this.refs = {}
    let node_list = this.shadowRoot.querySelectorAll('[id]')
    let node_array = Array.from(node_list)
    for (let node of node_array) {
      this.refs[node.id] = node
    }
  }

  _parse () {
    this._director = new Director()
    this._director.parse(this.shadowRoot)
  }

  _render () {
    this._director.render(this.shadowRoot, this)
    this.render()
  }

}

class Pantarei {

  static get version () { return '2.2.0' }

  static get directives () {
    return [
      DirectiveAttribute,
      DirectiveClass,
      DirectiveEvent,
      DirectiveProperty,
      DirectiveRepeat,
      DirectiveText
    ]
  }

  constructor (options) {
    if (!options) {
      throw new Error('argument is missing')
    }
    if (!options.el) {
      throw new Error('el is missing')
    }
    if (!(options.el instanceof HTMLElement)) {
      throw new Error('el is not an instance of HTMLElement')
    }
    this._root = options.el
    this._director = new Director(this._root)
    this._director.parse(this._root)

    if (!options.data) {
      options.data = {}
    }
    if (typeof options.data !== 'object') {
      throw new Error('data is not an object')
    }

    this._debounced_update = this.debounce(this._update, 16)

    this._data = {}
    this.data = {}
    this._watch(options.data)

    this._debounced_update()
  }

  _watch (data) {
    for (let name in data) {
      let value = data[name]
      this._watch_property(name, value)
    }
  }

  _watch_property (name, value) {
    let self = this

    self._data[name] = value

    Object.defineProperty(self.data, name, {
      get () {
        return self._data[name]
      },
      set (value) {
        if (self._data[name] === value) {
          return
        }
        self._data[name] = value
        self._debounced_update()
      }
    })
  }

  _update () {
    this._director.render(this._root, this.data, this)
  }

  debounce (func, wait) {
    wait = wait || 0
    let waiting = false
    let invoked = () => {
      waiting = false
      func.call(this)
    }
    let debounced = () => {
      if (waiting) {
        return
      }
      waiting = true
      setTimeout(invoked, wait)
    }
    return debounced
  }

}

Pantarei.Director = Director
Pantarei.Director.directives = Pantarei.directives
Pantarei.Element = Element
Pantarei.TemplateElement = TemplateElement

window['Pantarei'] = Pantarei