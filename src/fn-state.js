/**
 * @typedef {{state:string, context?:any}} CurrentState
 */
/**
 * @typedef {(string | function(Object, Object):CurrentState )} Transition
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
export default function state(name, transitions, enterFn = () => {}, exitFn = () => {}) {
  return {name, transitions, enter: enterFn, exit: exitFn};
}
