import { Director } from './director'

export class Component extends HTMLElement {

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