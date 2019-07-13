/**
 * @typedef {Object} StateRef
 * @property {string} name
 * @property {object} context
 */

/**
 * @typedef {import('./fn-state').default} State
 */

/**
 * @description define a state machine
 * @param {Array<State>} states
 * @param {string} initialState
 * @param {object} initialContext
 * @param {function(StateRef)=} changeCb
 * @return {function(string, object):StateRef}
 */
export default function machine(states, initialState, initialContext, changeCb = function(state){}) {
  // store current state (name) and context
  let current = initialState;
  let context = Object.assign({}, initialContext);

  /**
   * @param {string} event
   * @param {object} detail
   * @return {StateRef}
   */
  function send(event, detail) {
    // if no event, return the current state
    if (!event) {
      return {state:current, context};
    }
    // get the current/active state
    const active = states.find(s => s.name === current);
    // look for a transition
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
  return send;
}

