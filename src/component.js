'use strict'

import { Director } from './director.js'
import { Renderer } from './renderer.js'

export class Component extends HTMLElement {

  static get props () {
    return {
      data: { value: null }
    }
  }

  static get template () { return '' }

  static get template_url () { return 'template.html' }

  static get _template () {
    if (!this._promise_template) {
      this._promise_template = this._prepare_template()
    }
    return this._promise_template
  }

  static async _prepare_template () {
    let template = this.template
    if (template) {
      return template
    }

    template = await this._fetch_template()
    return template
  }

  static async _fetch_template () {
    let base_url = this.base_url.replace('/index.js', '/')

    let template_url = base_url + this.template_url
    try {
      let res = await fetch(template_url)
      let template = await res.text()
      return template
    } catch (err) {
      return ''
    }
  }

  static get style () { return '' }

  static get style_urls () { return ['style.css'] }

  static get _style () {
    if (!this._promise_style) {
      this._promise_style = this._prepare_style()
    }
    return this._promise_style
  }

  static async _prepare_style () {
    let style = this.style
    if (style) {
      style = `<style>${style}</style>`
    } else {
      style = await this._fetch_styles()
    }
    return style
  }

  static async _fetch_styles () {
    let styles = ''
    let base_url = this.base_url.replace('/index.js', '/')

    let style_urls = this.style_urls
    for (let style_url of style_urls) {
      style_url = base_url + style_url
      try {
        let res = await fetch(style_url)
        let text = await res.text()
        let style = `<style>\n${text}\n</style>`
        styles = `${styles}\n\n${style}`
      } catch (err) {

      }
    }
    return styles
  }

  static get components () { return [] }

  static get consumers () { return [] }

  constructor () {
    super()
    this._ready = this._init()
  }

  connectedCallback () {
    this._connected()
  }

  _find_components () {
    this._components = new Set()

    this._find_component(this.shadowRoot)
  }

  _find_component (node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName.includes('-')) {
      let name = node.nodeName.toLowerCase()
      this._components.add(name)
    }

    if (node.nodeName === 'TEMPLATE') {
      node = node.content
    }
    let children = node.children
    for (let child of children) {
      this._find_component(child)
    }
  }

  async _connected () {
    await this._ready

    this._find_components()
    this.fire('ready', this)

    // this.register.get_components(this._components)

    this._director = new Director(this)
    this._director.parse()

    this._renderer.render()
    // console.log(`${this.constructor.is} is attached`)
    this.fire('connected', this)
    this.connected()
  }

  connected () {}

  disconnectedCallback () {
    this.fire('disconnected', this)
    this.disconnected()
  }

  disconnected () {}

  fire (type, detail) {
    let config = { bubbles: true, cancelable: true, composed: true, detail: detail }
    let event = new CustomEvent(type, config)
    this.dispatchEvent(event)
    return this
  }

  action (name, data) {
    return new Promise((resolve, reject) => {

      let callback = (err, res) => {
        if (err) {
          reject(err)
          return
        }
        resolve(res)
      }

      let component = this

      this.fire('action', { name, data, callback, component })
    })
  }

  async (func) {
    requestAnimationFrame(func.bind(this))
  }

  async _init () {
    await this._init_content()
    this._init_render()
    this._init_props()
    this._init_refs()
    this.ready()
  }

  async _init_content () {
    let style_text = await this.constructor._style
    let template_text = await this.constructor._template
    let content = style_text + template_text

    let template = document.createElement('template')
    template.innerHTML = content
    let shadow = template.content

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(shadow)
  }

  _init_render () {
    this._renderer = new Renderer(this)
  }

  _init_props () {
    this.props = this.props || {}
    let descriptors = this.constructor.props

    for (let name in descriptors) {
      let descriptor = descriptors[name]
      this._init_prop(name, descriptor)
    }
  }

  _init_prop (name, descriptor) {
    let value = descriptor.value
    if (typeof value === 'function') {
      value = value()
    }
    this.props[name] = this[name] || value

    Object.defineProperty(this, name, {
      get () {
        return this.props[name]
      },
      set (value) {
        this.props[name] = value
        this._renderer.render()
      }
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

  _render () {
    this._director.render(this.props)
    this.render()
  }

  render () {}

  ready () {}

}