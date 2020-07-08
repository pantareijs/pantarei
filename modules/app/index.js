'use strict'

import mixin from '../mixin/index.js'
import AppRoot from '../app-root/index.js'
import AppContainer from '../app-container/index.js'
import AppController from '../app-controller/index.js'
import AppRouter from '../app-router/index.js'
import Path from '../path/index.js'
import Register from '../register/index.js'

class BaseApp {

  static get config () {
    return {}
  }

  static async start (config) {
    let app = new App(config)
    await app.start()
    return app
  }

  get base_url () {
    let origin = location.origin
    let pathname = location.pathname
    if (pathname.endsWith('.html')) {
      pathname = Path.join(pathname, '..')
    }
    let base_url = Path.join(origin, pathname)
    return base_url
  }

  async start () {}

}

export default class App extends mixin(BaseApp,
    AppRoot,
    AppContainer,
    AppController,
    AppRouter) {

  static get config () {
    return {
      ...super.config,
      components_path: 'components/'
    }
  }

  constructor () {
    super()
  }

  async start () {
    super.start()

    let base_url = this.base_url
    let config = this.constructor.config

    let components_path = config.components_path
    this.components_path = Path.join(base_url, components_path)
    this.components = {}

    this.register = new Register({ components_path: this.components_path })
  }

}