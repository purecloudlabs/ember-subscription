import {
  addSubscription,
  createSubscription,
  removeSubscription
} from './-core'

export function subscribe (target, source, events, handler, once, args = []) {
  addSubscription(target, createSubscription({
    target,
    source,
    events,
    handler,
    handlerArgs: args,
    handleOnce: once,
    isJQuery: false
  }))
}

export function subscribe$ (target, selector, events, handler, once, args = []) {
  addSubscription(target, createSubscription({
    target,
    source: selector,
    events,
    handler,
    handlerArgs: args,
    handleOnce: once,
    isJQuery: true
  }))
}

export class SubscriptionHook {
  constructor (effect) {
    this.effect = effect
  }

  static captureHooks (target) {
    for (const key in target) {
      const value = target[key]
      if (value instanceof SubscriptionHook) {
        value.effect(target)
      }
    }
  }
}

export class SubscriptionProxy {
  constructor (target, source) {
    if (typeof source === 'string') {
      source = target.get(source)
    }
    this.target = target
    this.source = source
  }

  on (events, handler, ...args) {
    const {target, source} = this
    subscribe(target, source, events, handler, false, args)
    return this
  }

  one (events, handler, ...args) {
    const {target, source} = this
    subscribe(target, source, events, handler, true, args)
    return this
  }

  off (events, handler) {
    const {target, source} = this
    removeSubscription(target, source, events, handler)
    return this
  }
}

export class JQuerySubscriptionProxy {
  constructor (target, selector) {
    this.target = target
    this.selector = selector
  }

  on (events, handler, ...args) {
    const {target, selector} = this
    subscribe$(target, selector, events, handler, false, args)
    return this
  }

  one (events, handler, ...args) {
    const {target, selector} = this
    subscribe$(target, selector, events, handler, true, args)
    return this
  }

  off (events, handler) {
    const {target, selector} = this
    removeSubscription(target, selector, events, handler)
    return this
  }
}
