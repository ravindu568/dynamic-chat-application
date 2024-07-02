import fs, {Stats} from 'fs';
import path from 'path';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import statAgain, {Stator, isNewerThan,
  expectEventuallyFound, expectEventuallyDeleted} from '../src/stat-again';

chai.use(chaiAsPromised);

describe('Testing module stat-again', function () {
  const cb = err => {
    if (err) {
      throw err;
    }
  };

  let counter = 0;

  it(`'statAgain' tries several times to stat a file'`, function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    setTimeout(fs.mkdir.bind(fs, name, cb), 200);

    return expect(statAgain(name, 50, 10)).to.eventually.be.instanceof(Stats);
  });

  it(`'statAgain' tries so many times before failing`, function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    setTimeout(fs.mkdir.bind(fs, name, cb), 1000);

    return statAgain(name, 30, 20).catch(err => {
      expect(err).to.match(
        new RegExp(`ENOENT: no such file or directory, stat '${name}'`));
    });
  });

  it(`'expectEventuallyFound' returns true on success`, function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    setTimeout(fs.mkdir.bind(fs, name, cb), 200);

    return expect(expectEventuallyFound(name, 50, 10))
      .to.be.eventually.true;
  });

  it(`'expectEventuallyFound' throws an error after too long`, function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    setTimeout(fs.mkdir.bind(fs, name, cb), 1000);

    return expectEventuallyFound(name, 30, 20)
      .catch(err => {
        expect(err).to.match(
          /Error: File '.*' could not be found within the imparted time frame'/);
      });
  });

  it(`'expectEventuallyDeleted' returns true on success`, function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    fs.mkdir(name, cb);
    setTimeout(fs.rmdir.bind(fs, name, cb), 200);

    return expect(expectEventuallyDeleted(name, 50, 10))
      .to.be.eventually.true;
  });

  it(`'expectEventuallyDeleted' throws on error after too long`, function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    fs.mkdir(name, cb);
    setTimeout(fs.rmdir.bind(fs, name, cb), 1000);

    return expectEventuallyFound(name, 30, 20)
      .catch(err => {
        expect(err).to.match(
          /`Error: File '.*' could not be deleted within the imparted time frame'`/);
      });
  });

  it(`'isNewerThan' can compare files`, function () {
    const date = new Date();
    const name1 = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));
    const name2 = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    return new Promise((resolve, reject) => {
      fs.mkdir(name1, err => {
        if (err) {
          return reject(err);
        }
        const fn = () => {
          fs.mkdir(name2, err => {
            if (err) {
              return reject(err);
            }
            isNewerThan(name1, name2).then(res =>
              expect(res).to.be.false).then(resolve, reject);
          }, cb);
        };
        setTimeout(fn, 10);
      });
    });
  });

  it('A Stator instance can stat files', function () {
    const stator = new Stator('gulpfile.babel.js');
    return expect(stator.stat()).to.eventually.be.instanceof(Stats);
  });

  it('A stator instance can try several times to stat a file', function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    const stator = new Stator(name);
    setTimeout(fs.mkdir.bind(fs, name, cb), 200);

    return expect(stator.insist(50, 10)).to.eventually.be.instanceof(Stats);
  });

  it('A stator instance will try so many times before failing', function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    const stator = new Stator(name);
    setTimeout(fs.mkdir.bind(fs, name, cb), 1000);

    return stator.insist(30, 20).catch(err => {
      expect(err).to.match(
        new RegExp(`ENOENT: no such file or directory, stat '${name}'`));
    });
  });

  it(`A stator instance has a method 'expectEventuallyFound'`, function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    const stator = new Stator(name);
    setTimeout(fs.mkdir.bind(fs, name, cb), 200);

    return expect(stator.expectEventuallyFound(50, 10))
      .to.be.eventually.true;
  });

  it(`The 'expectEventuallyFound' method throws an error after too long`,
    function () {
      const date = new Date();
      const name = path.join('/tmp', 'test_start-again_' + date.getTime()
         + '_' + (counter++));

      const stator = new Stator(name);
      setTimeout(fs.mkdir.bind(fs, name, cb), 1000);

      return stator.expectEventuallyFound(30, 20)
        .catch(err => {
          expect(err).to.match(
            /Error: File '.*' could not be found within the imparted time frame'/);
        });
    });

  it(`A stator instance has a method 'expectEventuallyDeleted'`, function () {
    const date = new Date();
    const name = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    const stator = new Stator(name);
    fs.mkdir(name, cb);
    setTimeout(fs.rmdir.bind(fs, name, cb), 200);

    return expect(stator.expectEventuallyDeleted(50, 10))
      .to.be.eventually.true;
  });

  it(`The 'expectEventuallyDeleted' method throws an error after too long`,
    function () {
      const date = new Date();
      const name = path.join('/tmp', 'test_start-again_' + date.getTime()
         + '_' + (counter++));

      const stator = new Stator(name);
      fs.mkdir(name, cb);
      setTimeout(fs.rmdir.bind(fs, name, cb), 1000);

      return stator.expectEventuallyDeleted(30, 20)
        .catch(err => {
          expect(err).to.match(
            /Error: File '.*' could not be deleted within the imparted time frame'/);
        });
    });

  it(`The 'isNewerThan' method can compare files`, function () {
    const date = new Date();
    const name1 = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));
    const name2 = path.join('/tmp', 'test_start-again_' + date.getTime()
       + '_' + (counter++));

    const stator1 = new Stator(name1);
    const stator2 = new Stator(name2);

    return new Promise((resolve, reject) => {
      fs.mkdir(name1, err => {
        if (err) {
          return reject(err);
        }
        const fn = () => {
          fs.mkdir(name2, err => {
            if (err) {
              return reject(err);
            }
            stator1.isNewerThan(stator2).then(res =>
              expect(res).to.be.false).then(resolve, reject);
          }, cb);
        };
        setTimeout(fn, 10);
      });
    });
  });
});
