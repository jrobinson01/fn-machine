import { expect } from 'chai';
import sinon from 'sinon';
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
  it('should call the initial state\'s enter function if provided',() => {
    const enter = sinon.spy();
    const initState = state('init',{}, enter);
    const m = machine([initState], 'init', {});
    sinon.assert.called(enter);
  });
  it('should call the next state\'s enter function if defined', async () => {
    const enter = sinon.spy();
    const initState = state('init', {go:'next'});
    const nextState = state('next', {}, enter);
    const m = machine([initState, nextState],'init');
    await m('go');
    sinon.assert.called(enter);
  });

  it('should call the previous state\'s exit function if defined', async () => {
    const exit = sinon.spy();
    const initState = state('init', {go:'next'}, exit);
    const nextState = state('next', {});
    const m = machine([initState, nextState],'init');
    await m('go');
    sinon.assert.called(exit);
  });
  it('async enter can resolve with a new context', async () => {
    const enter = async function(context) {
      return Promise.resolve({...context, ...{foo:'bar'}});
    };
    const initState = state('init', {go:'next'});
    const nextState = state('next', {}, enter);
    const m = await machine([initState, nextState], 'init', {});
    await m('go');
    const current = await m();
    expect(current.context.foo).to.eq('bar');
  });
  it('async enter can reject with a new context', async () => {
    const enter = async function(context) {
      return Promise.reject({...context, ...{foo:'bar'}});
    };
    const initState = state('init', {go:'next'});
    const nextState = state('next', {}, enter);
    const m = await machine([initState, nextState], 'init', {});
    await m('go');
    const current = await m();
    expect(current.context.foo).to.eq('bar');
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
          async asyncTransition(detail, context) {
            return Promise.resolve({
              state:STATES.OFF,
              context
            })
          },
          async rejectTransition(detail, context) {
            return Promise.reject({
              state: STATES.ON,
              context: {...context, error:'oops'},
            });
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

    it('should transition if the current state supports the event', async () => {
      const currentState = await myMachine('powerOn');
      expect(currentState.state).to.equal(STATES.ON);
    });

    it('should allow shorthand transitions', async () => {
      const currentState = await myMachine('shortHand', {foo:'bar'});
      expect(currentState.state).to.equal(STATES.OFF);
      expect(currentState.context.foo).to.equal('bar');
    });

    it('should not transition if the current state doesn\'t support the event', async () => {
      const currentState = await myMachine('noEvent');
      expect(currentState.state).to.equal(STATES.OFF);
    });

    it('should return the current state when called without an event', async () => {
      const currentState = await myMachine();
      expect(currentState.state).to.equal(STATES.OFF);
      expect(currentState.context.jigawatts).to.equal(11);
    });

    it('should not change context if the current state does not support the event', async () => {
      const initialState = await myMachine();
      const currentState = await myMachine('noEvent', {increase:11});
      expect(currentState.context.jigawatts).to.equal(initialState.context.jigawatts);
    });

    it('should return the updated the context', async () => {
      const initialState = await myMachine();
      const currentState = await myMachine('powerOn');
      expect(currentState.context.jigawatts).not.to.equal(initialState.context.jigawatts);
    });

    it('should use the detail object to update context', async () => {
      const currentState = await myMachine('increasePower', {increase:5});
      expect(currentState.context.jigawatts).to.equal(16);
    });

    it('should call the callback when state changes', async () => {
      await myMachine('powerOn');
      expect(callback.called).to.equal(true);
    });

    it('should throw an error if the desired state doesn\'t exist', async () => {
      await myMachine('powerOn');
      try {
        await myMachine('badState');
      } catch(e) {
        expect(e.message).to.eq('the transition \'badState\' of current state \'on\', returned a non-existant desired state \'bad\'.');
      }
    });
    it('should return the correct state when jumping', async () => {
     const currentState = await myMachine('stateJump');
     expect(currentState.state).to.equal(STATES.ERROR);
    });
    describe('async transition', () => {
      it('should resolve with the next state', async () => {
        await myMachine('powerOn');
        const next = await myMachine('asyncTransition');
        expect(next.state).to.eq(STATES.OFF);
      });
      it('should reject with the next state', async () => {
        await myMachine('powerOn');
        try {
          const next = await myMachine('rejectTransition');
        } catch(e) {
          expect(e.state).to.eq(STATES.ON);
          expect(e.context.error).to.eq('oops');

        }
        expect(callback.firstArg.context.error).to.eq('oops');
      });
    });
  });
});
