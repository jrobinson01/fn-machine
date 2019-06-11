/**
 * @description define a single state
 * @param {string} name
 * @param {object} transitions
 * @param {function} enterFn
 * @param {function} exitFn
 */
export default function state(name, transitions = {}, enterFn, exitFn) {
  return {name, transitions, enter: enterFn, exit: exitFn};
}
