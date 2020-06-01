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

import Lock from '../lock/index.js'

export default class Component extends mixin(HTMLElement,
    ComponentTemplate, ComponentStyles,
    ComponentContent, ComponentDirectives,
    ComponentParser, ComponentRenderer,
    ComponentProperties, ComponentData,
    ComponentComponents, ComponentParts,
    ComponentObserver, ComponentEvents) {

  constructor () {
    super()
    this.lock_shadow = new Lock()
    this.lock_connected = new Lock()
    this.lock_disconnected = new Lock()
    this.init()
  }

  async init () {
    if (super.init) {
      super.init()
    }
    this.init_shadow()

    await Promise.allSettled([
      this.lock_content.unlocked,
      this.lock_components.unlocked
    ])
    this.emit('ready', this)
  }

  init_shadow () {
    this.attachShadow({ mode: 'open' })
    this.lock_shadow.unlock()
  }

  connectedCallback () {
    this.connected()
  }

  disconnectedCallback () {
    this.disconnected()
  }

  async connected () {
    if (super.connected) {
      super.connected()
    }
    await this.lock_shadow.unlocked
    this.lock_connected.unlock()
  }

  async disconnected () {
    if (super.disconnected) {
      super.disconnected()
    }
    await this.lock_connected.unlocked
    this.lock_disconnected.unlock()
  }

}