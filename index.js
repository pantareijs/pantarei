'use strict'

import Director from './modules/director/index.js'
import Component from './modules/component/index.js'
import Container from './modules/container/index.js'
import Controller from './modules/controller/index.js'
import Router from './modules/router/index.js'
import Navigator from './modules/navigator/index.js'
import Emitter from './modules/emitter/index.js'
import Register from './modules/register/index.js'
import App from './modules/app/index.js'

let Pantarei = {
  Director,
  Component,
  Container,
  Controller,
  Router,
  Navigator,
  Emitter,
  Register,
  App
}

window['Pantarei'] = Pantarei

export default Pantarei