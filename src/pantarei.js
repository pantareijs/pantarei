import { Director } from './director'
import { DirectiveAttribute } from './directive-attribute'
import { DirectiveEvent } from './directive-event'
import { DirectiveProperty } from './directive-property'
import { DirectiveRepeat } from './directive-repeat'
import { DirectiveText } from './directive-text'
import { Element} from './element'
import { TemplateElement} from './template-element'

Director.directives = [
  DirectiveAttribute,
  DirectiveEvent,
  DirectiveProperty,
  DirectiveRepeat,
  DirectiveText
]

window['pantarei'] = {
  Director,
  DirectiveEvent,
  DirectiveAttribute,
  DirectiveProperty,
  DirectiveRepeat,
  DirectiveText,
  Element,
  TemplateElement
}