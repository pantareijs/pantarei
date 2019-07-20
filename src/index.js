'use strict'

import { Director } from './director.js'
import { DirectiveAttribute } from './directives/attribute.js'
import { DirectiveClassName } from './directives/classname.js'
import { DirectiveEvent } from './directives/event.js'
import { DirectiveProperty } from './directives/property.js'
import { DirectiveRepeat } from './directives/repeat.js'
import { DirectiveStyle } from './directives/style.js'
import { DirectiveToggle } from './directives/toggle.js'
import { DirectiveText } from './directives/text.js'
import { DirectiveHtml } from './directives/html.js'
import { Component } from './component.js'
import { Router } from './router.js'
import { Controller } from './controller.js'
import { Emitter } from './emitter.js'
import { Register } from './register.js'

import { App } from './app.js'

const Pantarei = {}

Pantarei.Register = Register

Pantarei.Emitter = Emitter
Pantarei.Component = Component

Pantarei.Director = Director
Pantarei.Director.directives = [
  DirectiveAttribute,
  DirectiveClassName,
  DirectiveEvent,
  DirectiveProperty,
  DirectiveRepeat,
  DirectiveToggle,
  DirectiveStyle,
  DirectiveText,
  DirectiveHtml
]

Pantarei.Router = Router

Pantarei.Controller = Controller

Pantarei.App = App

export { Pantarei }