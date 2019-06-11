const expect = require('chai').expect;

import {state} from '../index.js';

describe('state(name, transitions, enterFn, exitFn)', () => {
  it('should return an object with appropriate properties', () => {
    const s = state('foo', [], function(){}, function(){});
    expect(s.name).to.equal('foo');
    expect(s.transitions).to.be.an('Array');
    expect(s.enter).to.be.a('Function');
    expect(s.exit).to.be.a('Function');
  });
});

