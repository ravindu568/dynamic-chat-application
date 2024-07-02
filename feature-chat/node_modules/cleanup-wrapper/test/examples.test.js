import {expect} from 'chai';
import cleanupWrapper from '../src/cleanup-wrapper';

describe('Testing README.md examples:', function () {
  it(`Simple usage example`, function () {
    let obj = {id (x) {
      return x;
    }};
    const id = obj.id;

    function dirty (x) {
      const id = obj.id;
      obj.id = function (x) {
        return id('overridden: ' + x);
      };
      return obj.id(x);
    }

    expect(dirty('Hello')).to.equal('overridden: Hello');
    expect(dirty('World')).to.equal('overridden: overridden: World');
    expect(dirty('Hello')).to.equal(
      'overridden: overridden: overridden: Hello');
    expect(dirty('World')).to.equal(
      'overridden: overridden: overridden: overridden: World');

    obj.id = id; // Restores obj

    const clean = cleanupWrapper(dirty, {
      after () {
        obj.id = id;
      },
    });

    expect(clean('Hello')).to.equal('overridden: Hello');
    expect(clean('World')).to.equal('overridden: World');
    expect(clean('Hello')).to.equal('overridden: Hello');
    expect(clean('World')).to.equal('overridden: World');
  });

  it(`Custom options example`, function () {
    let hello = 'Hello';

    function dirty () {
      hello = 'Bye';
      return hello;
    }

    const clean = cleanupWrapper(dirty, {
      hello,
      after () {
        hello = this.hello;
      },
    });

    expect(dirty()).to.equal('Bye');
    expect(hello).to.equal('Bye');
    expect(clean()).to.equal('Bye');
    expect(hello).to.equal('Hello');
  });
});
