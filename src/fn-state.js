/**
 * @typedef {Object.<string, function(Object, Object):Object>} Transition
 */
/**
 * @typedef {{name:string, transitions:Object, enter:function, exit:function}} State
 */
/**
 * @description define a single state
 * @param {string} name
 * @param {Object.<string, Transition>=} transitions
 * @param {function=} enterFn
 * @param {function=} exitFn
 * @return {!State}
 */
export default function state(name, transitions = {}, enterFn = () => {}, exitFn = () => {}) {
  return {name, transitions, enter: enterFn, exit: exitFn};
}
