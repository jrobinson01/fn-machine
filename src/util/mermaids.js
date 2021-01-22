/** @typedef {import('../fn-state').State} State */

/**
 * @description convert a machine definition to mermaid syntax
 * @param {Array<!State>} states
 * @param {string} initialState
 * @return {string}
 */
function toMermaid(states, initialState) {
  const head = `\nstateDiagram-v2\n[*] --> ${initialState}`;
  const lines = states.reduce((acc, currentState, index, self) => {
    // create a line for each transition in currentState
    const tKeys = Object.keys(currentState.transitions);
    acc = acc.concat(tKeys.map(t => {
      const v = currentState.transitions[t];
      return `${currentState.name} --> ${typeof v === 'function' ? v({},{}).state : v}: ${t}`;
    }))
    return acc;
  },[]);
  return `${head}\n${lines.join('\n')}`
}

/**
 * @description convert a mermaid string to the 'states' parameter for calling machine(...)
 * @param {string} mermaid
 * @return {string}
 */
function fromMermaid(mermaid = '') {
  // split mermaid string on line breaks, filtering unwanted lines.
  // a line like "[*] --> off" is defining the initial state. ignore.
  const lines = mermaid.split('\n').filter(
    l => l.length &&
    !l.includes('stateDiagram-v2') &&
    !l.includes('[*]'));
  // for each line, we need to build up an array of state('stateName', {transitions})
  // a typical line: "on --> off : powerOff" or "state --> state : action"
  const transitions = lines.reduce((acc, val, index, self) => {
    const sp = val.split(' ');// split on whitespace
    const stateName = sp[0];
    const nextState = sp[2].replace(':', '');
    const action = sp[3];
    if (acc[stateName] === undefined) {
      acc[stateName] = {[action]: nextState}
    } else {
      // already exists, add new state
      acc[stateName] = {...acc[stateName], ...{[action]:nextState}};
    }
    return acc;
  }, {});
  const states = Object.keys(transitions).map(key => {
    return `state('${key}', {${Object.keys(transitions[key]).map(tkey => `${tkey}:'${transitions[key][tkey]}'`)}})`
  });
  const jsString = `[\n${states.join(',\n').replace('"','')}\n]`;
  return jsString;
}

export {toMermaid, fromMermaid}
