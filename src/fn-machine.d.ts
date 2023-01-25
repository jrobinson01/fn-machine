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
export default function machine(states: {
    name: string;
    transitions: {
        [x: string]: string | ((detail: any, context: any) => {
            state: string;
            context?: any;
        });
    };
    enter: Function;
    exit: Function;
}[], initialState: string, initialContext: any, changeCb?: (arg0: {
    state: string;
    context?: any;
}) => any, loggerFn?: (...arg0: any[]) => any): sendFn;
export type CurrentState = {
    state: string;
    context?: any;
};
export type State = {
    name: string;
    transitions: {
        [x: string]: string | ((detail: any, context: any) => {
            state: string;
            context?: any;
        });
    };
    enter: Function;
    exit: Function;
};
export type sendFn = (event?: string, detail?: any) => {
    state: string;
    context?: any;
};
