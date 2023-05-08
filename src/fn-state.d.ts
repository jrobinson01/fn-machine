/**
 * @typedef {{state:string, context?:any}} CurrentState
 */
/**
 * @typedef {(string | ((detail:any, context:any) => CurrentState|Promise<CurrentState> ))} Transition
 */
/**
 * @typedef {{name:string, transitions:Object.<string, Transition>, enter:function, exit:function}} State
 */
/**
 * @description define a single state
 * @param {string} name
 * @param {Object.<string, Transition>} transitions
 * @param {function(Object)=} enterFn
 * @param {function(Object)=} exitFn
 * @return {!State}
 */
export default function state(name: string, transitions: {
    [x: string]: string | ((detail: any, context: any) => {
        state: string;
        context?: any;
    } | Promise<{
        state: string;
        context?: any;
    }>);
}, enterFn?: (arg0: any) => any, exitFn?: (arg0: any) => any): {
    name: string;
    transitions: {
        [x: string]: string | ((detail: any, context: any) => {
            state: string;
            context?: any;
        } | Promise<{
            state: string;
            context?: any;
        }>);
    };
    enter: Function;
    exit: Function;
};
export type CurrentState = {
    state: string;
    context?: any;
};
export type Transition = string | ((detail: any, context: any) => {
    state: string;
    context?: any;
} | Promise<{
    state: string;
    context?: any;
}>);
export type State = {
    name: string;
    transitions: {
        [x: string]: string | ((detail: any, context: any) => {
            state: string;
            context?: any;
        } | Promise<{
            state: string;
            context?: any;
        }>);
    };
    enter: Function;
    exit: Function;
};
