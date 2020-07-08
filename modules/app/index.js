'use strict'

import mixin from '../mixin/index.js'
import AppRoot from '../app-root/index.js'
import AppRegister from '../app-register/index.js'
import AppContainer from '../app-container/index.js'
import AppController from '../app-controller/index.js'
import AppRouter from '../app-router/index.js'
import Path from '../path/index.js'

export default class App extends mixin(class {},
    AppRoot,
    AppRegister,
    AppContainer,
    AppController,
    AppRouter) {

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
