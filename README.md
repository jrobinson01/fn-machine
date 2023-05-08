# fn-machine
A tiny, functional, state machine utility

### install
`npm install --save fn-machine`

### usage
fn-machine consists of 3 functions. The first two are used to define a machine:

`machine([State], 'initialState', initialContextObj, stateChangeCallback, loggerFn)`

`state('name', transitionsObj, enterFunction, exitFunction)`

The third function is what would traditionally be called a `send()` function. This function is returned by calling `machine(...)`.

#### Setting up a machine
```javascript

// import the setup functions
import {machine, state} from 'fn-machine';

// initial context object
const initialContext = {
  loading: false,
  users: [],
};

function loadUsers() {
  // simulate a network request
  setTimeout(() => {
    // once the request completes, we can call `myMachine` (the 'send' function).
    myMachine('loaded', {users:['foo', 'bar']})
  }, 1000);
};

// initialize a machine
const myMachine = machine([
  state('initial', {
    // each method on this object represents a transition for this particular state.
    loadData: (detail, context) => {
      // a transition should return the new state, as well as the optional context.
      // here we return {state:'loadingData'} to signify we want the state to now be 'loadingData'.
      return {
        state:'loadingData',
      }
    }
  }),
  state('loadingData', {
    loaded: (detail, context) => {
      return {
        state: 'loadedData',
        context: {...context, ...detail, ...{loading: false}}
      }
    }
  }, context => {// call loadUsers when this state is entered, and return the new context.
    loadUsers();
    return {...context, ...{loading: true}};
  }),
  state('loadedData', {}) // 'loadedData' is an empty/final state. There are no transitions.
], 'initial', initialContext, newState => {
  console.log('myMachine state changed:', newState.state, newState.context);
}, console.log);// pass an optional logger function

```
In the `loadUsers()` function above, we invoke the third function provided by fn-machine, which is the send function. The send function takes a string as the first parameter, which is the name of a transition we'd like to invoke, and optionally a `detail` object, which contains some data we want the machine to work with, and/or update the context with.

You can also define transitions using a short-hand syntax like so:
```javascript
state('myState', {
  someAction: 'newState',
});
```
which is equivelent to:
```javascript
state('myState', {
  someAction: (detail, context) => {
    return {
      state: 'newState',
      context: {...context, ...detail},
    };
  },
});
```

#### Async transitions
Transitions can be asynchronous using async functions. This is useful for async operations where it is not necessary to have a specific "loading" or "waiting" state.
```javascript
const myMachine = machine([
  state('initial', {
    // each method on this object represents a transition for this particular state.
    async loadData(detail, context) {
      let response;
      let error = false;
      try {
        response = await fetch('someurl');
      } catch(e) {
        error = true;
      }
      return {
        state: error ? 'errorLoading' : 'loadedData',
        context: {...context, ...(error ? e : response)}
      }
    },
  }),
  state('errorLoading', {})
  state('loadedData', {})
], 'initial', initialContext, newState => {}, console.log);
```

#### Enter and exit functions
A state's `enter` function, if defined, is called with the current context as it's only parameter. The enter function can return, resolve or reject with a new context.
A state's `exit` function is not called with any parameters, and it's return value is ignored. Exit functions are typically used to signal to logic outside the machine that the given state has exited.

#### More examples

There is an [example](https://github.com/jrobinson01/fn-machine/blob/master/example/index.html) in this repo, or you can play around with this [codepen](https://codepen.io/johnrobinson/pen/rNBPodV?editors=1001) that shows a basic integration with [LitElement](https://github.com/Polymer/lit-element).

#### mermaid
There are two utility functions to convert to and from mermaid syntax.
```javascript
toMermaid([state('on', {powerOff: 'off'}, state('off', {powerOn: 'on'}))], 'off');
```
produces a string like that you can process with mermaidjs to visualize your machine:
```
stateDiagram-v2
[*] --> off
on --> off: powerOff
off --> on: powerOn
```

Or, you can take a mermaid string and output some stub javascript:
```javascript
const mermaidStr = `
stateDiagram-v2
[*] --> off
on --> off: powerOff
off --> on: powerOn
`;
fromMermaid(mermaidStr);
```
which produces:
```javascript
[state('on', {powerOff: 'off'}, state('off', {powerOn: 'on'}))]
```

These are useful for visualization and initial creation of your machines, but beware that if your machine transitions contain logic, that logic would be lost should you try to go full circle: machine -> mermaid -> machine.
#### Contributing
Yes! PR's are welcome. Tests are written in mocha. Run with `npm run test` or `yarn test`. Typechecking is provided by typescript via JSDoc annotations.
