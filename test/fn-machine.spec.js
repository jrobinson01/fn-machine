const expect = require('chai').expect;
const sinon = require('sinon');

import {machine, state} from '../index.js';

describe('machine(states, initialState, initialContext, changeCb)', () => {
  it('should return a \'send\' function', () => {
    const send = machine([state('foo')], 'foo', {});
    expect(send).to.be.a('Function');
  });

  describe('send(event, detail)', () => {
    let myMachine;
    let callback;
    beforeEach(() => {
      // define initial context
      const initialContext = {jigawatts: 11};
      callback = sinon.fake();
      // define a machine
      myMachine = machine([
        state('on', {
          powerOff(detail, context) {
            // return the next state name
            return {
              state:'off',
            };
          },
          increasePower(detail, context) {
            // add jigawatts
            const jigawatts = context.jigawatts + detail.increase;
            return {
              state: 'on',
              context: Object.assign({}, context, {jigawatts}),
            };
          },
          badState(detail, context) {
            // return a desired state that doesn't exist
            return {state:'bad'};
          },
        }),
        state('off', {
          powerOn(detail, context) {
            if (context.jigawatts <= 0) {
              // can't turn on, not enough jigawatts
              return {
                state: 'off',
                context: Object.assign({}, context)
              }
            }
            // return the next state name and new context
            return {
              state:'on',
              context:Object.assign({}, context, {jigawatts: context.jigawatts - 1})
            };
          },
          increasePower(detail, context) {
            // add jigawatts
            const jigawatts = context.jigawatts + detail.increase;
            return {
              state: 'off',
              context: Object.assign({}, context, {jigawatts}),
            };
          },
          shortHand: 'off',
        })
      ], 'off', initialContext, callback);
    });

    it('should transition if the current state supports the event', () => {
      const currentState = myMachine('powerOn');
      expect(currentState.state).to.equal('on');
    });

    it('should allow shorthand transitions', () => {
      const currentState = myMachine('shortHand', {foo:'bar'});
      expect(currentState.state).to.equal('off');
      expect(currentState.context.foo).to.equal('bar');
    });

    it('should not transition if the current state doesn\'t support the event', () => {
      const currentState = myMachine('noEvent');
      expect(currentState.state).to.equal('off');
    });

    it('should return the current state when called without an event', () => {
      const currentState = myMachine();
      expect(currentState.state).to.equal('off');
      expect(currentState.context.jigawatts).to.equal(11);
    });

    it('should not change context if the current state does not support the event', () => {
      const initialState = myMachine();
      const currentState = myMachine('noEvent', {increase:11});
      expect(currentState.context.jigawatts).to.equal(initialState.context.jigawatts);
    });

    it('should return the updated the context', () => {
      const initialState = myMachine();
      const currentState = myMachine('powerOn');
      expect(currentState.context.jigawatts).not.to.equal(initialState.context.jigawatts);
    });

    it('should use the detail object to update context', () => {
      const currentState = myMachine('increasePower', {increase:5});
      expect(currentState.context.jigawatts).to.equal(16);
    });

    it('should call the callback when state changes', () => {
      myMachine('powerOn');
      expect(callback.called).to.equal(true);
    });

    it('should throw an error if the desired state doesn\'t exist', () => {
      myMachine('powerOn');
      expect(function() {myMachine('badState')}).to.throw();
    });
  });
});
