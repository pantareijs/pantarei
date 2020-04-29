'use strict'

import Emitter from './emitter.js'

export default class Controller {

  constructor () {
    this.events = new Emitter()
  }

}