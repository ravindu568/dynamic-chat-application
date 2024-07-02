'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Stator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = statAgain;
exports.expectEventuallyFound = expectEventuallyFound;
exports.expectEventuallyDeleted = expectEventuallyDeleted;
exports.isNewerThan = isNewerThan;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stator = exports.Stator = function () {
  function Stator(pathname) {
    _classCallCheck(this, Stator);

    var _pathname = pathname;

    Object.defineProperty(this, 'pathname', {
      get: function get() {
        return _pathname;
      }
    });
  }

  _createClass(Stator, [{
    key: 'stat',
    value: function stat() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _fs2.default.stat(_this.pathname, function (err, stats) {
          if (err) {
            reject(err);
            return;
          }
          resolve(stats);
        });
      });
    }
  }, {
    key: 'isNewerThan',
    value: function isNewerThan(stator) {
      return this.stat().then(function (stats1) {
        return stator.stat().then(function (stats2) {
          return stats1.mtime > stats2.mtime;
        });
      });
    }
  }, {
    key: 'insist',
    value: function insist() {
      var _this2 = this;

      var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
      var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

      if (!Number.isInteger(times)) {
        throw TypeError('times is not an integer: ', times);
      }

      return this.stat().catch(function (err) {
        var res = err.message.match(/ENOENT: no such file or directory, stat '(.*)'/);
        if (res && res[1] === _this2.pathname) {
          // Expected error, this.pathname does not exist
          if (times > 0) {
            // Try again
            return new Promise(function (resolve, reject) {
              function tryAgain() {
                resolve(this.insist(delay, times - 1));
              }
              setTimeout(tryAgain.bind(_this2), delay);
            });
          } else {
            // Abort, too many attempts
            throw err;
          }
        } else {
          // Abort, unexpected error
          throw err;
        }
      });
    }
  }, {
    key: 'expectEventuallyFound',
    value: function expectEventuallyFound() {
      var _this3 = this;

      var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
      var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      return this.insist(delay, times).then(function (res) {
        return res instanceof _fs.Stats;
      }, function (err) {
        throw new Error('File \'' + _this3.pathname + '\'' + ' could not be found within the imparted time frame\'');
      });
    }
  }, {
    key: 'expectEventuallyDeleted',
    value: function expectEventuallyDeleted() {
      var _this4 = this;

      var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
      var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (!Number.isInteger(times)) {
        throw TypeError('times is not an integer: ', times);
      }

      return this.stat().then(function (res) {
        if (times > 0) {
          // Unhappy res, try again
          return new Promise(function (resolve, reject) {
            function tryAgain() {
              this.expectEventuallyDeleted(delay, times - 1).then(resolve, reject);
            }
            setTimeout(tryAgain.bind(_this4), delay);
          });
        } else {
          // Abort, too many attempts
          throw new Error('File \'' + _this4.pathname + '\'' + ' could not be deleted within the imparted time frame\'');
        }
      }, function (err) {
        var res = err.message.match(/ENOENT: no such file or directory, stat '(.*)'/);
        if (res && res[1] === _this4.pathname) {
          // Happy error, this.pathname does not exist
          return true;
        } else {
          // Abort, unexpected error
          throw err;
        }
      });
    }
  }]);

  return Stator;
}();

;

function statAgain(pathname) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  var times = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

  var stator = new Stator(pathname);
  return stator.insist(delay, times);
};

function expectEventuallyFound(pathname) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  var times = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var stator = new Stator(pathname);
  return stator.expectEventuallyFound(delay, times);
};

function expectEventuallyDeleted(pathname) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  var times = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var stator = new Stator(pathname);
  return stator.expectEventuallyDeleted(delay, times);
};

function isNewerThan(pathname1, pathname2) {
  var stator1 = new Stator(pathname1);
  var stator2 = new Stator(pathname2);
  return stator1.isNewerThan(stator2);
}