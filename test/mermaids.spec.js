const expect = require('chai').expect;
const sinon = require('sinon');

import {toMermaid, fromMermaid, state} from '../index.js';

const states = [
  state('on', {
    powerOff(detail, context) {
      // return the next state name
      return {
        state:'off',
      };
    },
  }),
  state('off', {
    powerOn(detail, context) {
      return {
        state:'on',
      };
    },
    shortHand: 'on',
  })
];

const mermaidString = `
stateDiagram-v2
[*] --> off
on --> off: powerOff
off --> on: powerOn
off --> on: shortHand`;

const jsString = `[
state('on', {powerOff:'off'}),
state('off', {powerOn:'on',shortHand:'on'})
]`

describe('toMermaid(states, initialState)', () => {
  it('should return a mermaid string', () => {
    const m = toMermaid(states, 'off');
    expect(m).to.eq(mermaidString);
  });
});

describe('fromMermaid(mermaid)', () => {
  it('should return a machine definition', () => {
    const m = fromMermaid(mermaidString);
    expect(m).to.eq(jsString);
  });
});
