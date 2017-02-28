/*
Evented/Emitter Differences:
thing       | Evented | Emitter
method:one  | one     | once
method:off  | off     | removeListener
eventName   | multple | single         (multiple = space separated)
*/
export function isEventEmitter (emitter) {
  return typeof emitter.once === 'function'
}

export function eventNames (eventName) {
  return eventName.split(/\s/).filter(name => name && name.length)
}

export function eventAddListener (emitter, eventName, eventHandler) {
  if (isEventEmitter(emitter)) {
    eventNames(eventName).forEach(name => {
      emitter.on(name, eventHandler)
    })
  } else {
    emitter.on(eventName, eventHandler)
  }
}

export function eventAddListenerOnce (emitter, eventName, eventHandler) {
  if (isEventEmitter(emitter)) {
    eventNames(eventName).forEach(name => {
      emitter.once(name, eventHandler)
    })
  } else {
    emitter.one(eventName, eventHandler)
  }
}

export function eventRemoveListener (emitter, eventName, eventHandler) {
  if (isEventEmitter(emitter)) {
    eventNames(eventName).forEach(name => {
      emitter.removeListener(name, eventHandler)
    })
  } else {
    emitter.off(eventName, eventHandler)
  }
}
