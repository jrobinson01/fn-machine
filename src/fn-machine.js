/**
 * @typedef CurrentState
 * @property {string} state
 * @property {Object} context
 */

// annoyingly, this typedef has to be duplicated from fn-state.js??
/**
 * @typedef {{name:string, transitions:Object, enter:function, exit:function}} State
 */

/**
 * @description define a state machine
 * @param {Array<!State>} states
 * @param {string} initialState
 * @param {Object} initialContext
 * @param {function(CurrentState)=} changeCb
 * @return {function(string, Object):CurrentState}
 */
export default function machine(states, initialState, initialContext, changeCb = function(state){}) {
  // store current state (name) and context
  let current = initialState;
  let context = Object.assign({}, initialContext);
  const currentState = {state: current, context};
  /**
   * @param {string} event
   * @param {Object} detail
   * @return {CurrentState}
   */
  return function send(event, detail) {

    // if no event, return the current state
    if (!event) {
      return currentState;
    }
    // get the current/active state
    const active = states.find(s => s.name === current);
    // look for a transition
    if (active) {
      const transitionKey = Object.keys(active.transitions || {}).find(k => k === event);
      const transition = active.transitions[transitionKey];
      // if there's a transition, call it, otherwise just return the current state.
      const next = transition ? transition(detail, context) : {state: current, context};
      // if the current state has an exit function, run it.
      active.exit && active.exit();
      const newState = states.find(s => s.name === next.state);
      // if the new state has an enter function, run it as well.
      newState.enter && newState.enter(next.context);
      // update current
      current = next.state;
      // update next.context if necessary
      next.context = context = next.context ? next.context : context;
      // call callback with the latest state.
      changeCb(next);
      return next;
    }
    return currentState;

  }
}

