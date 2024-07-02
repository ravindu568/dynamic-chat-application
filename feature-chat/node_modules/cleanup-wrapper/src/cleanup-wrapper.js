import {expectEventuallyDeleted} from 'stat-again';
import del from 'del';

export default function cleanupWrapper (func, _options) {
  const options = Object.assign({
    before: function () {},
    after: function () {},
  }, _options);

  return function (...args) {
    let bef = options.before();

    const exec = () => {
      try {
        let ret = func.apply(this, args);
        if (ret instanceof Promise) {
          return ret.then(res => {
            let aft = options.after();
            return aft instanceof Promise ? aft.then(() => res) : res;
          }, err => {
            let aft = options.after();
            if (aft instanceof Promise) {
              return aft.then(() => Promise.reject(err));
            } else {
              throw err;
            }
          });
        } else {
          let aft = options.after();
          return aft instanceof Promise ? aft.then(() => ret) : ret;
        }
      } catch (err) {
        let aft = options.after();
        if (aft instanceof Promise) {
          return aft.then(() => Promise.reject(err));
        } else {
          throw err;
        }
      }
    };

    if (bef instanceof Promise) {
      return bef.then(exec);
    } else {
      return exec();
    }
  };
};

export function tmpDir (dir, func) {
  const dirs = Array.isArray(dir) ? dir : [dir];
  return cleanupWrapper(func, {
    dirs,
    before () {
      return Promise.all(this.dirs.map(dir => expectEventuallyDeleted(dir)
        .catch(err => {
          if (err.message.match(
            /File '.*' could not be deleted within the imparted time frame/)) {
            throw new Error(
              `Dir '${dir}' already exists`);
          } else {
            throw err;
          }
        })));
    },
    after () {
      return del(this.dirs);
    },
  });
};

export function chDir (cwd, func) {
  const oldcwd = process.cwd();

  return cleanupWrapper(func, {
    cwd,
    oldcwd,
    before () {
      process.chdir(this.cwd);
    },
    after () {
      process.chdir(this.oldcwd);
    },
  });
};

export function overrideMethod (object, methodName, newMethod, func) {
  return cleanupWrapper(func, {
    object, methodName, newMethod,
    method: object[methodName],
    before () {
      this.object[this.methodName] = this.newMethod;
    },
    after () {
      this.object[this.methodName] = this.method;
    },
  });
};
