"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Muter;
exports.muted = muted;
exports.captured = captured;

var _simpleMuter = _interopRequireDefault(require("./simple-muter"));

var _advancedMuter = _interopRequireDefault(require("./advanced-muter"));

var _cleanupWrapper = _interopRequireDefault(require("cleanup-wrapper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Muter(logger, method, options = {}) {
  if (logger === process || logger === undefined) {
    return new Muter([process.stdout, 'write'], [process.stderr, 'write']);
  } else if (logger === console && method === undefined) {
    return new Muter([console, 'log'], [console, 'info'], [console, 'warn'], [console, 'error']);
  } else if (Array.isArray(logger)) {
    // eslint-disable-next-line prefer-rest-params
    return new _advancedMuter.default(...arguments);
  } else if (Object.keys(options).length > 0) {
    return new Muter([logger, method, options]);
  } else {
    return new _simpleMuter.default(logger, method);
  }
}

function muted(muter, func) {
  return (0, _cleanupWrapper.default)(func, {
    muter,

    before() {
      this.muter.mute();
    },

    after() {
      this.muter.unmute();
    }

  });
}

;

function captured(muter, func) {
  return (0, _cleanupWrapper.default)(func, {
    muter,

    before() {
      this.muter.capture();
    },

    after() {
      this.muter.uncapture();
    }

  });
}

;
Muter.muted = muted;
Muter.captured = captured;