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
    ComponentTemplate, ComponentStyles,
    ComponentContent, ComponentDirectives,
    ComponentParser, ComponentRenderer,
    ComponentProperties, ComponentData,
    ComponentComponents, ComponentParts,
    ComponentObserver, ComponentEvents) {

  constructor () {
    super()
    this.locks = new Locker()
    this.init()
  }

  async init () {
    if (super.init) {
      super.init()
    }
    this.init_shadow()

    await this.locks.unlocked([
      'content',
      'data',
      'properties',
      'components'
    ])

    this.locks.unlock('ready')
    this.emit('ready', this)
  }

  init_shadow () {
    this.attachShadow({ mode: 'open' })
    this.locks.unlock('shadow')
  }

  connectedCallback () {
    this.connected()
  }

  async connected () {
    await this.locks.unlocked('shadow')
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