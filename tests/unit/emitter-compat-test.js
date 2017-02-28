import Ember from 'ember'
import {test, module} from 'qunit'

import {
  mockEmitter,
  mockEvented
} from '../helpers/mocks'

import {
  isEventEmitter,
  eventNames
} from 'ember-subscription/-emitter-compat'

module('Unit - emitter-compat')

test('isEventEmitter() should detect emitters and not Evented objects', t => {
  const evented = mockEvented()
  const emitter = mockEmitter()
  const realEvented = Ember.Object.extend(Ember.Evented).create()

  t.equal(isEventEmitter(evented), false)
  t.equal(isEventEmitter(emitter), true)
  t.equal(isEventEmitter(realEvented), false)
})

test('eventNames() should return an array of events', t => {
  t.deepEqual(eventNames('bar'), ['bar'])
  t.deepEqual(eventNames('bar foo'), ['bar', 'foo'])
  t.deepEqual(eventNames(' bar \n\n foo\n baz\n'), ['bar', 'foo', 'baz'])
})
