import Ember from 'ember'
import {test, module} from 'qunit'

import {
  mockEmitter,
  mockEvented
} from '../helpers/mocks'

import {
  subscribe,
  subscribeOnce,
  subscriptionsFor,
  SubscriptionMixin
} from 'ember-subscription'

import {atom} from 'ember-subscription/-core'

module('Unit - subscription', {
  beforeEach () {
    atom.store = null
  }
})

function mockObject () {
  return Ember.Object.extend(SubscriptionMixin)
}

function destroyThen (object, callback) {
  Ember.run(() => {
    object.destroy()
    Ember.run.scheduleOnce('destroy', () => {
      callback()
    })
  })
}

test('subscribe() should add a subscription to the store', t => {
  const emitter = mockEmitter()
  const eventNames = 'foo'
  const Subscriber = mockObject().extend({
    mySub: subscribe(emitter, eventNames, function () {})
  })
  const subber = Subscriber.create()
  const subs = subscriptionsFor(subber)

  t.equal(subs.length, 1)
  t.equal(subs[0].metadata.source, emitter)
  t.equal(subs[0].metadata.eventNames, eventNames)
})

test('subscribe() should call source.on()', t => {
  const emitter = mockEmitter()
  const eventNames = 'bar'
  const Subscriber = mockObject().extend({
    mySub: subscribe(emitter, eventNames, function () {})
  })

  Subscriber.create()

  t.equal(emitter.history.length, 1)
  const [call] = emitter.history

  t.equal(call.method, 'on')

  const [event, handler] = call.args
  t.equal(event, eventNames)
  t.equal(typeof handler, 'function')
})

test('subscribeOnce() should call emitter.once()', t => {
  const emitter = mockEmitter()
  const eventNames = 'bar'
  const Subscriber = mockObject().extend({
    mySub: subscribeOnce(emitter, eventNames, function () {})
  })

  Subscriber.create()

  t.equal(emitter.history.length, 1)
  const [call] = emitter.history

  t.equal(call.method, 'once')

  const [event, handler] = call.args
  t.equal(event, eventNames)
  t.equal(typeof handler, 'function')
})

test('subscribeOnce() should call evented.one()', t => {
  const emitter = mockEvented()
  const eventNames = 'bar'
  const Subscriber = mockObject().extend({
    mySub: subscribeOnce(emitter, eventNames, function () {})
  })

  Subscriber.create()

  t.equal(emitter.history.length, 1)
  const [call] = emitter.history

  t.equal(call.method, 'one')

  const [event, handler] = call.args
  t.equal(event, eventNames)
  t.equal(typeof handler, 'function')
})

/*
test('subscribe$() should call component.$().on()', t => {
  t.expect(7)

  const component = mockComponent().extend({
    profileClick: subscribe$('.dat-button-tho', 'click', function () {}),
    $ () {
      const receive = (eventName, selector, handler) => {
        t.equal(eventName, 'click')
        t.equal(selector, '.dat-button-tho')
        t.equal(typeof handler, 'function')
      }

      return {
        on: receive,
        off: receive
      }
    }
  }).create()

  t.equal(subscriptionsFor(component).length, 1, 'event should be queued')

  component.didInsertElement()
  component.willDestroyElement()
})

test('subscribe$() should call component.$().one()', t => {
  t.expect(7)

  const component = mockComponent().extend({
    profileClick: subscribeOnce$('.dat-button-tho', 'click', function () {}),
    $ () {
      const receive = (eventName, selector, handler) => {
        t.equal(eventName, 'click')
        t.equal(selector, '.dat-button-tho')
        t.equal(typeof handler, 'function')
      }

      return {
        one: receive,
        off: receive
      }
    }
  }).create()

  t.equal(subscriptionsFor(component).length, 1, 'event should be queued')

  component.didInsertElement()
  component.willDestroyElement()
})
*/

test('subscribeTo() should have {on, off, one} and chain', t => {
  const source = mockEmitter()
  const subject = mockObject().extend({
    test () {
      const proxy = this.subscribeTo(source)

      t.equal(typeof proxy.on, 'function')
      t.equal(typeof proxy.one, 'function')
      t.equal(typeof proxy.off, 'function')

      t.equal(proxy, proxy.on('foo', () => {}))
      t.equal(proxy, proxy.one('foo', () => {}))
      t.equal(proxy, proxy.off('foo', () => {}))
    }
  }).create()

  subject.test()
})

test('subscribeTo().on() should add a subscription to the store', t => {
  const event = 'foo'
  const handler = function () {}
  const emitter = mockEmitter()
  const subject = mockObject().extend({
    setup () {
      this.subscribeTo(emitter).on(event, handler)
    }
  }).create()

  subject.setup()

  const subscriptions = subscriptionsFor(subject)
  t.equal(subscriptions.length, 1)
  t.equal(subscriptions[0].metadata.eventNames, event)
  t.equal(subscriptions[0].metadata.source, emitter)
})

/*
test('subscribeTo$() should have {on, off, one} and chain', t => {
  const selector = '.the-button'
  const subject = mockComponent().extend({
    test () {
      const proxy = this.subscribeTo$(selector)

      t.equal(typeof proxy.on, 'function')
      t.equal(typeof proxy.one, 'function')
      t.equal(typeof proxy.off, 'function')

      t.equal(proxy, proxy.on('foo', () => {}))
      t.equal(proxy, proxy.one('foo', () => {}))
      t.equal(proxy, proxy.off('foo', () => {}))
    }
  }).create()

  subject.test()
})
*/

test('object emitter events should detach on willDestroy', t => {
  const emitter = mockEmitter()
  const Subject = mockObject().extend({
    foo: subscribe(emitter, 'bar', function () {})
  })

  t.equal(emitter.history.length, 0)

  const subject = Subject.create()

  t.equal(emitter.history.length, 1, 'on should have been called')
  t.equal(subscriptionsFor(subject).length, 1, 'a subscription should have been added')

  destroyThen(subject, () => {
    t.equal(emitter.history.length, 2)
    t.equal(subscriptionsFor(subject).length, 0)

    const [, removal] = emitter.history
    t.equal(removal.method, 'removeListener')
  })
})

/*
test('component emitter events should detach on willDestroyElement', t => {
  const emitter = mockEmitter()
  const Subject = mockComponent().extend({
    foo: subscribe(emitter, 'bar', function () {})
  })

  t.equal(emitter.history.length, 0)

  const subject = Subject.create()
  subject.didInsertElement()

  t.equal(emitter.history.length, 1, 'on should have been called')
  t.equal(subscriptionsFor(subject).length, 1, 'a subscription should have been added')

  subject.willDestroyElement()

  t.equal(emitter.history.length, 2)
  t.equal(subscriptionsFor(subject).length, 0)

  const [, removal] = emitter.history
  t.equal(removal.method, 'removeListener')
})
*/

test('object evented events should detach on willDestroy', t => {
  const emitter = mockEvented()
  const Subject = mockObject().extend({
    foo: subscribe(emitter, 'bar', function () {})
  })

  t.equal(emitter.history.length, 0)

  const subject = Subject.create()

  t.equal(emitter.history.length, 1, 'on should have been called')
  t.equal(subscriptionsFor(subject).length, 1, 'a subscription should have been added')

  destroyThen(subject, () => {
    t.equal(emitter.history.length, 2)
    t.equal(subscriptionsFor(subject).length, 0)

    const [, removal] = emitter.history
    t.equal(removal.method, 'off')
  })
})

/*
test('component evented events should detach on willDestroyElement', t => {
  const emitter = mockEvented()
  const Subject = mockComponent().extend({
    foo: subscribe(emitter, 'bar', function () {})
  })

  t.equal(emitter.history.length, 0)

  const subject = Subject.create()
  subject.didInsertElement()

  t.equal(emitter.history.length, 1, 'on should have been called')
  t.equal(subscriptionsFor(subject).length, 1, 'a subscription should have been added')

  subject.willDestroyElement()

  t.equal(emitter.history.length, 2)
  t.equal(subscriptionsFor(subject).length, 0)

  const [, removal] = emitter.history
  t.equal(removal.method, 'off')
})
*/

test('event handlers can be added after initial attach and be cleaned up', t => {
  const evented = mockEvented()
  const subject = mockObject().create()

  subject.subscribeTo(evented).on('foo', function () {})

  t.equal(subscriptionsFor(subject).length, 1)
  t.equal(evented.history.length, 1)

  destroyThen(subject, () => {
    t.equal(evented.history.length, 2)
    t.equal(subscriptionsFor(subject).length, 0)

    const [, removal] = evented.history
    t.equal(removal.method, 'off')
  })
})

test('event handlers added after detach are dropped', t => {
  const evented = mockEvented()
  const subject = mockObject().create()

  destroyThen(subject, () => {
    subject.subscribeTo(evented).on('foo', function () {})
    t.equal(subscriptionsFor(evented).length, 0)
  })
})

test('event handers can be removed before the detach', t => {
  const evented = mockEvented()
  const subject = mockObject().extend({
    myThing: evented
  }).create()

  const handler = function () {}
  subject.subscribeTo('myThing').on('foo', handler)

  t.equal(subscriptionsFor(subject).length, 1)

  subject.subscribeTo('myThing').off('foo', handler)

  t.equal(subscriptionsFor(subject).length, 0)
})
