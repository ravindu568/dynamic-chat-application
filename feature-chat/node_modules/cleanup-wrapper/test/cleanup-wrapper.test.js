import gulp from 'gulp';
import {expect} from 'chai';
import cleanupWrapper from '../src/cleanup-wrapper';
import del from 'del';
import cached from 'gulp-cached';
import {expectEventuallyFound, expectEventuallyDeleted}
  from 'stat-again';

describe('Testing cleanupWrapper', function () {
  it(`Making sure a tmp file is deleted`, function () {
    function dirty () {
      return new Promise((resolve, reject) => {
        gulp.src('.babelrc').pipe(gulp.dest('tmp'))
          .on('end', resolve)
          .on('error', reject);
      });
    }

    const clean = cleanupWrapper(dirty, {
      after () {
        return del('tmp');
      },
    });

    return dirty().then(() => {
      return expectEventuallyFound('tmp/.babelrc', 50, 10).then(bool => {
        if (!bool) {
          throw new Error(
            `File 'tmp/.babelrc' was not created by 'dirty' function`);
        }
      });
    }).then(() => {
      return clean();
    }).then(() => {
      return expectEventuallyDeleted('tmp/.babelrc', 50, 10).then(bool => {
        if (!bool) {
          throw new Error(
            `File 'tmp/.babelrc' was not deleted by 'clean' function`);
        }
      });
    });
  });

  it(`Making sure a cache is deleted`, function () {
    const cacheName = 'tmp-cache';

    function dirty () {
      return new Promise((resolve, reject) => {
        gulp.src('.babelrc').pipe(cached(cacheName))
          .on('finish', resolve)
          .on('error', reject);
      });
    }

    const clean = cleanupWrapper(dirty, {
      after () {
        return delete cached.caches[cacheName];
      },
    });

    return dirty().then(() => {
      expect(cached.caches[cacheName]).not.to.be.undefined;
      return clean();
    }).then(() => {
      expect(cached.caches[cacheName]).to.be.undefined;
    });
  });

  it(`Making sure an overridden method is restored`, function () {
    let obj = {
      title () {
        return 'original title';
      },
    };

    function dirty () {
      obj.title = function () {
        return 'overridden title';
      };
      return obj.title();
    }

    const clean = cleanupWrapper(dirty, {
      title: obj.title,
      after () {
        obj.title = this.title;
      },
    });

    expect(dirty()).to.equal('overridden title');
    expect(obj.title()).to.equal('overridden title');

    expect(clean()).to.equal('overridden title');
    expect(obj.title()).to.equal('original title');
  });

  describe('Testing returned types', function () {
    [
      function () {
        return 'before';
      },
      function () {
        return Promise.resolve('before');
      },
    ].forEach((before, b) => {
      [
        function () {
          return 'func';
        },
        function () {
          return Promise.resolve('func');
        },
      ].forEach((func, f) => {
        [
          function () {
            return 'after';
          },
          function () {
            return Promise.resolve('after');
          },
        ].forEach((after, a) => {
          const title = `When:
          'before'  returns a ${b%2 ? 'Promise' : 'String'}
          'func'    returns a ${f%2 ? 'Promise' : 'String'}
          'after'   returns a ${a%2 ? 'Promise' : 'String'}
        Then:
          'wrapper' returns a ${b%2 || f%2 || a%2 ? 'Promise' : 'String'}`;

          it(title, function () {
            const clean = cleanupWrapper(func, {before, after});

            let ret = clean();
            if (b%2 || f%2 || a%2) {
              expect(ret).to.be.instanceof(Promise);
              ret.then(res => {
                expect(res).to.equal('func');
              });
            } else {
              expect(ret).to.equal('func');
            }
          });
        });
      });
    });
  });
});
