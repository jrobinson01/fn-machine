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
/** @typedef {import('../fn-state').State} State */
/**
 * @description convert a machine definition to mermaid syntax
 * @param {Array<!State>} states
 * @param {string} initialState
 * @return {string}
 */
export function toMermaid(states: import("../fn-state").State[], initialState: string): string;
/**
 * @description convert a mermaid string to the 'states' parameter for calling machine(...)
 * @param {string} mermaid
 * @return {string}
 */
export function fromMermaid(mermaid?: string): string;
