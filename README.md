# Ember Subscription

Ember event handling that sucks less.

```sh
ember install ember-subscription
```

## Summary

We should provide a good, consistent approach to handling the bookkeeping involved
with subscribing to events from `Ember.Evented` and `EventEmitter` objects and jQuery events.

## Motivation

We are providing this mixin because maintaining event driven code is hard
enough even without the bookkeeping pitfalls. This mixin supports un/subscribing
to both Ember's `Evented`, node's `EventEmitter`, and jQuery events. Any place where
emitter-style event handlers are setup is a good place to use this mixin.

The subscription mixin does two things:

- It wraps jQuery event handlers in `run()` and binds the provided event
  handler to the object that calls the mixin.

- It automatically calls `off` on all event handlers when the object's
  `willDestroy` or `willDestroyElement` hooks are triggered.

This is good because the bookkeeping (remembering to detach the listener, bind
the event handler to the component) is handled for us.

## Detailed design

Better to show a usage example first:

```js
import Ember from 'ember';
import { SubscriptionMixin } from 'ember-subscription';

const {
  on,
  inject,
  Component
} = Ember;

const WeBrTcThing = Component.extend(SubscriptionMixin, {
  wEbRtC: inject.service(),

  WEBrtcEvents: on('didInsertElement', function () {
    const service = this.get('wEbRtC');
    const proxy = this.subscribeTo(service);
    proxy.on('phoneCallReceived', this.handlePhoneCall, 'received');
  }),

  handlePhoneCall (eventType) {
    Ember.assert('partial application example:', eventType === 'received');
    // do something
  }
});
```

Things to note:

- The service is wrapped, not modified in any way. The subscription mixin is
  the intermediary which will track all the handlers. The service/emitter needs
  no special logic.

- The mixin provides a `subscribeTo()` method. This is the main method the
  mixin exposes to keep the API surface small. The `subscribeTo(target, service)` returns
  an object with chain-able methods (`eventNames` is space separated names):

  * `on(eventNames: string, handler: function, ...partialArgs: [any])`

  * `one(eventNames: string, handler: function, ...partialArgs: [any])`

  * `off(eventNames: string, handler: function, ...partialArgs: [any])`

- We don't need to call `off()` here. Any open subscriptions are closed on the
  `willDestroyElement` hook.

### Shorthand syntax

The `subscribeTo` is flexible to different handling styles, but we can add
more turtles: the `subscribe` and `subscribeOnce` functions.

```js
import Ember from 'ember';
import {
  subscribe,
  subscribeOnce,
  SubscriptionMixin
} from 'ember-subscription';

import sockets from '../fake/socket-emitter'

const WeBrTcThing = Ember.Component.extend(SubscriptionMixin, {
  wEbRtC: Ember.inject.service(),

  handlePhoneCall: subscribe('wEbRtC', 'phoneCallReceived', function () {
    // do something
  }),

  socketsConnected: subscribeOnce(sockets, 'connected', function () {
    // do something once
  })
});
```

Things to note:

- **This is preferred.** Everything is in one place. We don't need one method to attach and one to
  call, instead it is all one method which is equivalent to the above. Except
  for the partial application bit which is not supported here.

- We used string `"wEbRtC"` but can also pass an actual event emitter instead.
  A string is used internally like `this.get("wEbRtC")` so it does not have to
  be a service, it could also be an emitter.

- `subscribe` and `subscribeOnce` bind on `didInsertElement` for components and
  `init` for everything else. For completeness, here are their function signatures:

   * `subscribe(emitter: string | emitter, eventNames: string, handler: function)`

   * `subscribeOnce(emitter: string | emitter, eventNames: string, handler: function)`

### jQuery handlers

There are special functions for dealing with jQuery event handlers in your components.
They are `subscribe$()`, `subscribeOnce$()`, and `subscribeTo$()`. These act just like
their emitter counterparts except they accept selectors instead.

```js
import Ember from 'ember'

const {
  run,
  Component
} = Ember

export default Component.extend({
  didInsertElement () {
    this._super(...arguments)
    const startCallHandler = event => {
      // Ember needs to put this in the run loop
      run(() => this.startCall(event))
    }
    this.$().on('click', '.call-button', startCallHandler)
    run.schedule('afterRender', () => {
      // we shouldn't set in didInsertElement
      this.set('startCallHander', startCallHandler)
    })
  },

  willDestroyElement () {
    this._super(...arguments)
    const startCallHandler = this.get('startCallHandler')
    this.$('.call-button').off('click', startCallHandler)
    this.set('startCallHandler', null)
  },

  startCall (event) {
    // start the call
  }
})
```

This plain Ember is equivalent to:

```js
import Ember from 'ember'
import {
  subscribe$,
  SubscriptionMixin
} from 'ember-subscription'

export default Ember.Component.extend(SubscriptionMixin, {
  startCall: subscribe$('.call-button', 'click', function (event) {
    // start the call
  })
})
```

## Considerations

The subscription mixin has a very small API. It unifies differences
between Ember.Evented and EventEmitter behind the scenes so there is only one
correct way to use it. Some further considerations:

### Ember Objects friendly

By default, handlers are attached on `init` and detached on `willDestroy`.
For components however, handlers are attached on `didInsertElement` and
`willDestroyElement` which are the preferred events.

### Code locality

We do not need to remember to detach handlers, so we can put our subscription
and handler logic closer together in the code. There was a lot of reason to
stuff `init()` and `willDestroy()` with side-effects, but we can keep
related code in one place now and not worry about it (as much).

### Not a silver bullet

The mixin does not solve the problem of temporary event handling. Life-long
events are fine but it is important to remember that handlers will only be
automatically cleaned up when the component is destroyed. Any sooner and use of
the `subscribeTo(...).off()` method is necessary.

### Debugging events

This mixin gives us another nice quality: event handler debugging sucks less.
This is because we store all subscriptions per component.
A given object's subscriptions are accessible via `subscriptionsFor(object)`.

```js
import {subscriptionsFor} from 'ember-purecloud-components/utils/subscription';
const subscriptions = subscriptionsFor(myObject);
```

If you want to see if an object is listening to any emitter, check the
subscription array which contains subscriptions of this shape:

```js
{
  metadata: {
    source: Ember.Evented | EventEmitter | String,
    eventNames: String,
    eventHandler: Function,
    rawHandler: Function // what you passed in
  },
  attach: Function, // adds the listener to the source
  detach: Function  // removes the listener from the source
}
```

## Contributing
### Installation

* `git clone` this repository
* `npm install`
* `bower install`

### Running

* `ember server`
* Visit your app at http://localhost:4200.

### Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).

Follow me on [Twitter](https://twitter.com/compooter) for updates or just for the lolz and please check out my other [repositories](https://github.com/andrejewski) if I have earned it. I thank you for reading.
