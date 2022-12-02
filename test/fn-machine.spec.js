const expect = require('chai').expect;
const sinon = require('sinon');

import {machine, state} from '../index.js';
const STATES = {
  ON: 'on',
  OFF: 'off',
  JUMP:'jump',
  ERROR:'error',
}
describe('machine(states, initialState, initialContext, changeCb)', () => {
  it('should return a \'send\' function', () => {
    const send = machine([state('foo')], 'foo', {});
    expect(send).to.be.a('Function');
  });
  it('should run the initial states enter function if provided',() => {
    const enter = sinon.spy();
    const initState = state('init',{}, enter);
    const m = machine([initState], 'init', {});
    sinon.assert.called(enter);
  })

  describe('send(event, detail)', () => {
    let myMachine;
    let callback;
    beforeEach(() => {
      // define initial context
      const initialContext = {jigawatts: 11};
      callback = sinon.fake();
      // define a machine
      myMachine = machine([
        state(STATES.ON, {
          powerOff(detail, context) {
            // return the next state name
            return {
              state:STATES.OFF,
            };
          },
          increasePower(detail, context) {
            // add jigawatts
            const jigawatts = context.jigawatts + detail.increase;
            return {
              state: STATES.ON,
              context: Object.assign({}, context, {jigawatts}),
            };
          },
          badState(detail, context) {
            // return a desired state that doesn't exist
            return {state:'bad'};
          },

        }),
        state(STATES.OFF, {
          powerOn(detail, context) {
            if (context.jigawatts <= 0) {
              // can't turn on, not enough jigawatts
              return {
                state: STATES.OFF,
                context: Object.assign({}, context)
              }
            }
            // return the next state name and new context
            return {
              state:STATES.ON,
              context:Object.assign({}, context, {jigawatts: context.jigawatts - 1})
            };
          },
          increasePower(detail, context) {
            // add jigawatts
            const jigawatts = context.jigawatts + detail.increase;
            return {
              state: STATES.OFF,
              context: Object.assign({}, context, {jigawatts}),
            };
          },
          shortHand: STATES.OFF,
          stateJump(detail, context) {
            return {state:STATES.JUMP}
          }
        }),
        state(STATES.JUMP, {
         error: STATES.ERROR,
        }, () => {
          // entry
          myMachine('error')
        }),
        state(STATES.ERROR, {})
      ], STATES.OFF, initialContext, callback);
    });

    it('should transition if the current state supports the event', () => {
      const currentState = myMachine('powerOn');
      expect(currentState.state).to.equal(STATES.ON);
    });

    it('should allow shorthand transitions', () => {
      const currentState = myMachine('shortHand', {foo:'bar'});
      expect(currentState.state).to.equal(STATES.OFF);
      expect(currentState.context.foo).to.equal('bar');
    });

    it('should not transition if the current state doesn\'t support the event', () => {
      const currentState = myMachine('noEvent');
      expect(currentState.state).to.equal(STATES.OFF);
    });

    it('should return the current state when called without an event', () => {
      const currentState = myMachine();
      expect(currentState.state).to.equal(STATES.OFF);
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
    it('should return the correct state when jumping', () => {
     const currentState = myMachine('stateJump');
     expect(currentState.state).to.equal(STATES.ERROR);
    })
  });
});
