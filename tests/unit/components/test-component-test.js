import { moduleFor, test } from 'ember-qunit'

moduleFor('component:test-component', 'Unit | test-component', {
  unit: true
})

import {
  mockEmitter,
  mockEvented
} from '../../helpers/mocks'

import {
  subscribe,
  subscribe$,
  subscribeOnce$,
  subscriptionsFor
} from 'ember-subscription'

test('subscribe$() should call component.$().on()', function (t) {
  t.expect(7)

  const component = this.subject({
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
  })

  t.equal(subscriptionsFor(component).length, 1, 'event should be queued')

  component.didInsertElement()
  component.willDestroyElement()
})

test('subscribe$() should call component.$().one()', function (t) {
  t.expect(7)

  const component = this.subject({
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
  })

  t.equal(subscriptionsFor(component).length, 1, 'event should be queued')

  component.didInsertElement()
  component.willDestroyElement()
})

test('subscribeTo$() should have {on, off, one} and chain', function (t) {
  const selector = '.the-button'
  const subject = this.subject({
    test () {
      const proxy = this.subscribeTo$(selector)

      t.equal(typeof proxy.on, 'function')
      t.equal(typeof proxy.one, 'function')
      t.equal(typeof proxy.off, 'function')

      t.equal(proxy, proxy.on('foo', () => {}))
      t.equal(proxy, proxy.one('foo', () => {}))
      t.equal(proxy, proxy.off('foo', () => {}))
    }
  })

  subject.test()
})

test('component emitter events should detach on willDestroyElement', function (t) {
  const emitter = mockEmitter()
  t.equal(emitter.history.length, 0)

  const subject = this.subject({
    foo: subscribe(emitter, 'bar', function () {})
  })
  subject.didInsertElement()

  t.equal(emitter.history.length, 1, 'on should have been called')
  t.equal(subscriptionsFor(subject).length, 1, 'a subscription should have been added')

  subject.willDestroyElement()

  t.equal(emitter.history.length, 2)
  t.equal(subscriptionsFor(subject).length, 0)

  const [, removal] = emitter.history
  t.equal(removal.method, 'removeListener')
})

test('component evented events should detach on willDestroyElement', function (t) {
  const emitter = mockEvented()
  t.equal(emitter.history.length, 0)

  const subject = this.subject({
    foo: subscribe(emitter, 'bar', function () {})
  })
  subject.didInsertElement()

  t.equal(emitter.history.length, 1, 'on should have been called')
  t.equal(subscriptionsFor(subject).length, 1, 'a subscription should have been added')

  subject.willDestroyElement()

  t.equal(emitter.history.length, 2)
  t.equal(subscriptionsFor(subject).length, 0)

  const [, removal] = emitter.history
  t.equal(removal.method, 'off')
})
