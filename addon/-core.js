import Ember from 'ember'
import {
  eventAddListener,
  eventAddListenerOnce,
  eventRemoveListener
} from './-emitter-compat'

const {
  run,
  guidFor,
  Component
} = Ember

// addon state
// it's a Clojure thing
export let atom = {}

export function initialStore () {
  return {
    subscriptions: {},
    didAttach: {},
    didDetach: {}
  }
}

export function lifecycle (target, hookEvent) {
  if (!atom.store) {
    atom.store = initialStore()
  }

  const id = guidFor(target)
  if (!atom.store.subscriptions[id]) {
    atom.store.subscriptions[id] = []
  }

  const isComponent = target instanceof Component
  const attachEvent = isComponent ? 'didInsertElement' : 'init'
  const detachEvent = isComponent ? 'willDestroyElement' : 'willDestroy'

  if (hookEvent === attachEvent) {
    atom.store.subscriptions[id].forEach(s => s.attach())
    atom.store.didAttach[id] = true
  }

  if (hookEvent === detachEvent) {
    atom.store.subscriptions[id].forEach(s => s.detach())
    delete atom.store.subscriptions[id]
    atom.store.didDetach[id] = true
  }
}

export function addSubscription (target, subscription) {
  lifecycle(target)
  const id = guidFor(target)
  if (atom.store.didDetach[id]) {
    return
  }

  if (atom.store.didAttach[id]) {
    subscription.attach()
  }

  atom.store.subscriptions[id].push(subscription)
}

export function removeSubscription (target, source, events, handler) {
  const id = guidFor(target)
  const subscriptions = atom.store.subscriptions[id]
  const match = subscriptions.find(({metadata: s}) => (
    s.source === source &&
    s.eventNames === events &&
    s.rawHandler === handler
  ))

  if (!match) {
    return
  }

  match.detach()
  atom.store.subscriptions[id] = subscriptions.filter(s => s !== match)
}

export function createSubscription (data) {
  const {
    target,
    source,
    events,
    handler,
    handlerArgs,
    handleOnce,
    isJQuery
  } = data
  const baseHandler = run.bind(target, handler, ...handlerArgs)
  const safeHandler = (...args) => run(() => baseHandler(...args))
  const callback = isJQuery ? safeHandler : baseHandler
  const metadata = {
    source,
    rawHandler: handler,
    eventNames: events,
    eventHandler: callback
  }

  return {
    metadata,
    attach () {
      if (isJQuery) {
        if (handleOnce) {
          target.$().one(events, source, callback)
        } else {
          target.$().on(events, source, callback)
        }
      } else {
        if (handleOnce) {
          eventAddListenerOnce(source, events, callback)
        } else {
          eventAddListener(source, events, callback)
        }
      }
    },
    detach () {
      if (isJQuery) {
        target.$().off(events, source, callback)
      } else {
        eventRemoveListener(source, events, callback)
      }
    }
  }
}

export function listSubscriptions (target) {
  if (typeof target !== 'string') {
    target = guidFor(target)
  }
  return atom.store.subscriptions[target] || []
}
