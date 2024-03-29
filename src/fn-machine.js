/** @typedef {import('./fn-state').CurrentState} CurrentState */
/** @typedef {import('./fn-state').State} State */

/**
 * @description send an event through the machine
 * @callback sendFn
 * @param {string=} event
 * @param {any=} detail
 * @return {CurrentState}
 */

 /**
 * @description define a state machine
 * @param {Array<!State>} states
 * @param {string} initialState
 * @param {Object} initialContext
 * @param {function(CurrentState)=} changeCb
 * @param {function(...any)=} loggerFn
 * @return {sendFn}
 */
export default function machine(states, initialState, initialContext, changeCb = function(){}, loggerFn = function(){}) {
  // store current state (name) and context
  let current = initialState;
  let context = Object.assign({}, initialContext);
  // get initial state, run it's enter function if necessary
  const first = states.find(s => s.name === initialState);
  first && first.enter && first.enter();

  return function send(event, detail = {}) {
    loggerFn(`sent '${event}'`, detail? detail: '');
    // if no event, return the current state
    if (!event) {
      loggerFn(`no event. returning current state '${current}'`);
      loggerFn('context:', context);
      return {state:current, context};
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
        {state: transition, context: {...context, ...detail}} :
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
        loggerFn('context is now:', next.context);
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
      return {state:current, context};
    }
    loggerFn('could not find active state');
    return {state:current, context};
  }
}

