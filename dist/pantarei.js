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

class Directive {

  static get type () {
    throw new Error('static property `type` must be overridden')
  }

  static match (attribute) {
    throw new Error('static method `match` must be overridden')
  }

  static parse (node, attribute) {
    throw new Error('static method `parse` must be overridden')
  }

  run (node, context) {
    throw new Error('instance method `run` must be overridden')
  }

}

function getter (path) {
  let parts = path.split('.')
  let n = parts.length

  if (n == 1) {
    return (object) => {
      return object[path]
    }
  }

  return (value) => {
    let i = 0
    while (i < n && value) {
      let part = parts[i]
      value = value[part]
      i += 1
    }
    return value
  }

}

class DirectiveAttribute extends Directive {

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
    let path = this.parse_value(attribute)
    let directive = new this({ node, name, path })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.name = options.name
    this.path = options.path
    this.getter = getter(this.path)
  }

  run (node, context) {
    let name = this.name
    let value = this.getter(context)
    node.setAttribute(name, value)
  }

}

class DirectiveClassName extends Directive {

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
    let path = this.parse_value(attribute)
    let directive = new this({ node, name, path })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.name = options.name
    this.path = options.path
    this.getter = getter(this.path)
  }

  run (node, context) {
    let name = this.name
    let value = this.getter(context)
    node.classList.toggle(this.name, !!value)
  }

}

class DirectiveEvent extends Directive {

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
    let handler_path = attribute.value

    let directive = new this({ node, event_name, handler_path })
    return directive
  }

  constructor (options) {
    super(options)
    let node = this.node = options.node
    let root_node = this.root_node = node._root_node
    let event_name = this.event_name = options.event_name
    let handler_path = this.handler_path = options.handler_path
    this.getter = getter(this.handler_path)

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
    let object = this.root_node.host ? this.root_node.host : context
    let event_listener = this.getter(object)
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
          let root_node = target.getRootNode ? target.getRootNode() : target
          let host = root_node ? root_node.host : root_node._context
          let node = host ? host : target
          listener.call(node, event, event.detail)
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

class DirectiveProperty extends Directive {

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
    let path = this.parse_value(attribute)
    let directive = new this({ node, name, path })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.name = options.name
    this.path = options.path
    this.getter = getter(this.path)
  }

  run (node, context) {
    let name = this.name
    let value = this.getter(context)

    if (name === 'checked' && node.nodeName === 'INPUT') {
      node.checked = !!value
      return
    }
    if (name === 'focus' && node.nodeName === 'INPUT') {
      if (!!value) {
        node.focus()
      }
      return
    }

    node[name] = value
  }

}

class DirectiveRepeat extends Directive {

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
    let items_path = node.getAttribute('repeat') || this.items_path
    let item_name = node.getAttribute('item') || this.item_name
    let index_name = node.getAttribute('index') || this.index_name

    let directive = new this({ node, items_path, item_name, index_name, director_node })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.items_path = options.items_path
    this.getter = getter(this.items_path)
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
    node._new_items = this.getter(data) || []

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

class DirectiveText extends Directive {

  static get type () { return 'text' }

  static match (attribute) {
    return attribute.name === 'text'
  }

  static parse (node, attribute) {
    if (!this.match(attribute)) {
      return
    }

    let path = attribute.value
    let directive = new this({ node, path })
    return directive
  }

  constructor (options) {
    super(options)
    this.node = options.node
    this.path = options.path
    this.getter = getter(this.path)
  }

  run (node, data) {
    let value = this.getter(data)
    node.innerText = value
  }

}

class Component extends HTMLElement {

  static get is () { throw new Error('static getter `is` must be overridden') }

  static get props () { return {} }

  static get render_delay () { return 16 }

  get template () { return '' }

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
    if (this._initialized) {
      return
    }
    this._init_render()
    this._init_props()
    this._init_content()
    this._init_refs()
    this._parse()
    this.ready()
    this._render()
    this._initialized = true
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
    let template_text = this.template
    let template = document.createElement('template')
    template.innerText = template_text
    let content = template.content
    this.shadowRoot.appendChild(content)
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

  static get version () { return '3.0.0' }

  static get directives () {
    return [
      DirectiveAttribute,
      DirectiveClassName,
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
    Director.directives = this.constructor.directives
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

Pantarei.Component = Component

self['Pantarei'] = Pantarei
