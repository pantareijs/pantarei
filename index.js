'use strict'

import Component from './modules/component/index.js'
import Container from './modules/container/index.js'
import Controller from './modules/controller/index.js'
import Router from './modules/router/index.js'
import Navigator from './modules/navigator/index.js'
import Emitter from './modules/emitter/index.js'
import Register from './modules/register/index.js'
import App from './modules/app/index.js'

import DirectiveAttribute from './modules/directive-attribute/index.js'
import DirectiveClassName from './modules/directive-class/index.js'
import DirectiveData from './modules/directive-data/index.js'
import DirectiveEvent from './modules/directive-event/index.js'
import DirectiveProperty from './modules/directive-property/index.js'
import DirectiveRepeat from './modules/directive-repeat/index.js'
import DirectiveStyle from './modules/directive-style/index.js'
import DirectiveToggle from './modules/directive-toggle/index.js'
import DirectiveText from './modules/directive-text/index.js'
import DirectiveHtml from './modules/directive-html/index.js'

Component.directives = [
  DirectiveAttribute,
  DirectiveClassName,
  DirectiveData,
  DirectiveEvent,
  DirectiveProperty,
  DirectiveRepeat,
  DirectiveStyle,
  DirectiveToggle,
  DirectiveText,
  DirectiveHtml
]

let Pantarei = {
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
