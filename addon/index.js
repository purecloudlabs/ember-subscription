import Ember from 'ember'
import {
  lifecycle,
  listSubscriptions
} from './-core'
import {
  SubscriptionHook,
  SubscriptionProxy,
  JQuerySubscriptionProxy
} from './-subscription'

const {Mixin} = Ember

export function subscribe (source, eventNames, eventHandler) {
  return new SubscriptionHook(target => {
    (new SubscriptionProxy(target, source)).on(eventNames, eventHandler)
  })
}

export function subscribeOnce (source, eventNames, eventHandler) {
  return new SubscriptionHook(target => {
    (new SubscriptionProxy(target, source)).one(eventNames, eventHandler)
  })
}

export function subscribe$ (selector, eventNames, eventHandler) {
  return new SubscriptionHook(target => {
    (new JQuerySubscriptionProxy(target, selector)).on(eventNames, eventHandler)
  })
}

export function subscribeOnce$ (selector, eventNames, eventHandler) {
  return new SubscriptionHook(target => {
    (new JQuerySubscriptionProxy(target, selector)).one(eventNames, eventHandler)
  })
}

export function subscriptionsFor (target) {
  return listSubscriptions(target)
}

export const SubscriptionMixin = Mixin.create({
  init () {
    lifecycle(this, 'init')
    SubscriptionHook.captureHooks(this)
    this._super(...arguments)
  },

  didInsertElement () {
    lifecycle(this, 'didInsertElement')
    this._super(...arguments)
  },

  willDestroyElement () {
    lifecycle(this, 'willDestroyElement')
    this._super(...arguments)
  },

  willDestroy () {
    lifecycle(this, 'willDestroy')
    this._super(...arguments)
  },

  subscribeTo (source) {
    return new SubscriptionProxy(this, source)
  },

  subscribeTo$ (selector) {
    return new JQuerySubscriptionProxy(this, selector)
  }
})
