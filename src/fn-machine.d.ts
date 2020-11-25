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
export default function machine(states: {
    name: string;
    transitions: {
        [x: string]: string | ((arg0: any, arg1: any) => {
            state: string;
            context?: any;
        });
    };
    enter: Function;
    exit: Function;
}[], initialState: string, initialContext: any, changeCb?: (arg0: {
    state: string;
    context?: any;
}) => any, loggerFn?: (arg0: any) => any): (arg0: string, arg1?: any) => {
    state: string;
    context?: any;
};
export type CurrentState = {
    state: string;
    context?: any;
};
export type State = {
    name: string;
    transitions: {
        [x: string]: string | ((arg0: any, arg1: any) => {
            state: string;
            context?: any;
        });
    };
    enter: Function;
    exit: Function;
};
