/** @typedef {import('./fn-state').CurrentState} CurrentState */
/** @typedef {import('./fn-state').State} State */
/**
* @description define a state machine
* @param {Array<!State>} states
* @param {string} initialState
* @param {Object} initialContext
* @param {function(CurrentState)=} changeCb
* @return {function(string, Object):CurrentState}
*/
export default function machine(states: {
    name: string;
    transitions: any;
    enter: Function;
    exit: Function;
}[], initialState: string, initialContext: any, changeCb?: (arg0: {
    state: string;
    context: any;
}) => any): (arg0: string, arg1: any) => {
    state: string;
    context: any;
};
export type CurrentState = {
    state: string;
    context: any;
};
export type State = {
    name: string;
    transitions: any;
    enter: Function;
    exit: Function;
};
