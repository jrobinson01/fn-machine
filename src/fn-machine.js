/** @typedef {import('./fn-state').CurrentState} CurrentState */
/** @typedef {import('./fn-state').State} State */

 /**
 * @description define a state machine
 * @param {Array<!State>} states
 * @param {string} initialState
 * @param {Object} initialContext
 * @param {function(CurrentState)=} changeCb
 * @param {function(any)=} loggerFn
 * @return {function(string, Object=):CurrentState?}
 */
export default function machine(states, initialState, initialContext, changeCb = function(){}, loggerFn = function(){}) {
  // store current state (name) and context
  let current = initialState;
  let context = Object.assign({}, initialContext);
  const currentState = {state: current, context};

  return function send(event, detail = {}) {
    loggerFn(`sent '${event}'`);
    // if no event, return the current state
    if (!event) {
      loggerFn(`no event. returning currentState`);
      return currentState;
    }
    // get the current/active state
    const active = states.find(s => s.name === current);
    // look for a transition
    if (active) {
      const transitionKey = Object.keys(active.transitions || {}).find(k => k === event);
      const transition = active.transitions[transitionKey];
      // if there's a transition function, call it
      const next = transition instanceof Function ?
        transition(detail, context) :
        // if the transition is a string, return it as the next state, and
        // automatically merge detail and context
        typeof transition === 'string' ?
        {state: transition, context: {...detail, ...context}} :
        // otherwise just keep the current state.
        {state: current, context};

      // we only want to run exit, enter and the callback IF a transition was run.
      if (transition) {
        const newState = states.find(s => s.name === next.state);
        if (!newState) {
          // throw if next state is undefined
          throw `the transition '${event}' of current state '${current}', returned a non-existant desired state '${next.state}'.`;
        }
        // if the current state has an exit function, run it.
        active.exit && active.exit();
        // update current
        current = next.state;
        // update next.context if necessary
        next.context = context = next.context ? next.context : context;
        // call callback with the latest state.
        loggerFn(`state changed to '${next.state}'`);
        changeCb(next);
        // if the new state has an enter function, run it as well.
        // enter _can_ change state
        // enter can also optionally return a new context
        const newContext = (newState.enter && newState.enter(next.context || context));
        // since a common use case for an enter fn is to call an async method (usually loading data),
        // ignore the return if it's a promise. This is not foolproof, but should
        // handle most cases.
        if (newContext && !(newContext instanceof Promise)) {
          context = next.context = newContext;
          // run changeCb again if context has changed
          changeCb(next);
        }

      } else {
        loggerFn(`state '${current}' does not handle event '${event}'.`);
      }

      return next;
    }
    loggerFn('could not find active state');
    return currentState;

  }
}

