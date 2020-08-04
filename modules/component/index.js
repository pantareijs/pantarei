'use strict'

import mixin from '../mixin/index.js'

import ComponentTemplate from '../component-template/index.js'
import ComponentStyles from '../component-styles/index.js'
import ComponentContent from '../component-content/index.js'
import ComponentDirectives from '../component-directives/index.js'
import ComponentProperties from '../component-properties/index.js'
import ComponentData from '../component-data/index.js'
import ComponentComponents from '../component-components/index.js'
import ComponentParts from '../component-parts/index.js'
import ComponentParser from '../component-parser/index.js'
import ComponentRenderer from '../component-renderer/index.js'
import ComponentObserver from '../component-observer/index.js'
import ComponentEvents from '../component-events/index.js'

import Locker from '../locker/index.js'

export default class Component extends mixin(HTMLElement,
    ComponentTemplate,
    ComponentStyles,
    ComponentContent,
    ComponentComponents,
    ComponentDirectives,
    ComponentData,
    ComponentParser,
    ComponentRenderer,
    ComponentProperties,
    ComponentParts,
    ComponentObserver,
    ComponentEvents) {

  static module_url = import.meta.url

  static get base_url () {
    if (this._base_url) {
      return this._base_url
    }

    let module_url = this.module_url
    let base_url_length = module_url.lastIndexOf('/')
    let base_url = module_url.slice(0, base_url_length)
    this._base_url = base_url

    return this._base_url
  }

  constructor () {
    super()
    this.locks = new Locker()
    this.init()
  }

  async init () {
    super.init()
    this.init_root()

    await this.locks.unlocked([
      'template',
      'styles',
      'content',
      'components',
      'directives',
      'data',
      'props',
      'parsed',
      'render'
    ])

    this.emit('ready', this)
    this.locks.unlock('ready')
    this.ready()
  }

  ready () {}

  init_root (mode='open') {
    this.attachShadow({ mode })
    this.locks.unlock('shadow')
  }

  connectedCallback () {
    this.connected()
  }

  async connected () {
    await this.locks.unlocked('shadow')
    this.emit('connected', this)
    this.locks.unlock('connected')
  }

  disconnectedCallback () {
    this.disconnected()
  }

  async disconnected () {
    await this.locks.unlocked('connected')
    this.locks.unlock('disconnected')
  }

}