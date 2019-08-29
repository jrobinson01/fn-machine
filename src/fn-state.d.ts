/**
 * @typedef {{state:string, context:Object}} CurrentState
 */
/**
 * @typedef {Object.<string, function(Object, Object):CurrentState>} Transition
 */
/**
 * @typedef {{name:string, transitions:Object, enter:function, exit:function}} State
 */
/**
 * @description define a single state
 * @param {string} name
 * @param {Object.<string, Transition>=} transitions
 * @param {function(Object)=} enterFn
 * @param {function(Object)=} exitFn
 * @return {!State}
 */
export default function state(name: string, transitions?: {
    [x: string]: {
        [x: string]: (arg0: any, arg1: any) => {
            state: string;
            context: any;
        };
    };
}, enterFn?: (arg0: any) => any, exitFn?: (arg0: any) => any): {
    name: string;
    transitions: any;
    enter: Function;
    exit: Function;
};
export type CurrentState = {
    state: string;
    context: any;
};
export type Transition = {
    [x: string]: (arg0: any, arg1: any) => {
        state: string;
        context: any;
    };
};
export type State = {
    name: string;
    transitions: any;
    enter: Function;
    exit: Function;
};
