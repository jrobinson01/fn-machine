/** @typedef {import('./fn-state').CurrentState} CurrentState */
/** @typedef {import('./fn-state').State} State */

/**
 * @description send an event through the machine
 * @callback sendFn
 * @param {string=} event
 * @param {any=} detail
 * @return {Promise<CurrentState>}
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

  return async function send(event, detail = {}) {
    loggerFn(`sent '${event}'`, detail? detail: '');
    // if no event, return the current state
    if (!event) {
      loggerFn(`no event. returning current state: '${current}'`);
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
      let next;
      try {
        next = transition instanceof Function ?
        await transition(detail, context) :
        // if the transition is a string, return it as the next state, and
        // automatically merge detail and context
        typeof transition === 'string' ?
        {state: transition, context: {...context, ...detail}} :
        // otherwise just keep the current state.
        {state: current, context};
      } catch(e) {
        next = e;
      }
      // we only want to run exit, enter and the callback IF a transition was run.
      if (transition) {
        const newState = states.find(s => s.name === next.state);
        if (!newState) {
          // throw if next state is undefined
          throw new Error(`the transition '${event}' of current state '${current}', returned a non-existant desired state '${next.state}'.`);
        }
        // if the current state has an exit function, run it.
        try {
          active.exit && await active.exit();
        } catch(e) {
          throw e;
        }
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
        let newContext;

        if (newState.enter) {
          try {
            newContext = await newState.enter(next.context || context);
          } catch(e) {
            newContext = e;
          }
        }

        if (newContext) {
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

