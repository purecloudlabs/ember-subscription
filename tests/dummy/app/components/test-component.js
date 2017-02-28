import Ember from 'ember'
import layout from '../templates/components/test-component'
import {SubscriptionMixin} from 'ember-subscription'

export default Ember.Component.extend(SubscriptionMixin, {
  layout
})
