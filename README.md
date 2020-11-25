# fn-machine
A tiny, functional, state machine utility

### install
`npm install --save fn-machine`

### usage
fn-machine consists of 3 functions. The first two are used to define a machine:

`machine([State], 'initialState', initialContextObj, stateChangeCallback, loggerFn)`

`state('name', transitionsObj, enterFunction, exitFunction)`

The third function is what would traditionally be called a `send()` function. This function is returned whenever `machine(...)` is called.

#### Setting up a machine
```javascript

// import the setup functions
import {machine, state} from 'fn-machine';

// initial context object
const initialContext = {
  loading: false,
  users: []
}

function loadUsers() {
  // simulate a network request
  setTimeout(() => {
    // once the request completes, we can call `myMachine` (the 'send' function).
    myMachine('loaded', {users:['foo', 'bar']})
  }, 1000);
}

// initialize a machine
const myMachine = machine([
  state('initial', {
    // each method on this object represents a transition for this particular state.
    loadData: (detail, context) => {
      // a transition method should return the new state, as well as the optional context.
      // here we return {state:'loadingData'} to signify we want the state to now be 'loadingData', and
      // that the context.loading property should be true.
      return {
        state:'loadingData',
        context: {...context, ...{loading: true}}
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
  }, context => {// call loadUsers when this state is entered
    loadUsers();
  }),
  state('loadedData', {}) // 'loaded' is an empty state. There are no transitions.
], 'initial', initialContext, newState => {
  console.log('myMachine state changed:', newState.state, newState.context);
}, console.log);// pass an optional logger function

```
As you can see in the `loadUsers()` function above, we invoke the third function provided by fn-machine, which is the send function. The send function takes a string as the first parameter, which is the name of a transition we'd like to invoke, and optionally a `detail` object, which might contain some data we want the machine to work with.

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

#### More examples

There is an [example](https://github.com/jrobinson01/fn-machine/blob/master/example/index.html) in this repo, or you can play around with this [codepen](https://codepen.io/johnrobinson/pen/rNBPodV?editors=1001) that shows a basic integration with [LitElement](https://github.com/Polymer/lit-element).


#### Contributing
Yes! PR's are welcome. Tests are written in mocha. Run with `npm run test` or `yarn test`. Typechecking is provided by typescript via JSDoc annotations.
