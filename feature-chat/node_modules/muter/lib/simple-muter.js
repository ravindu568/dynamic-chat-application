"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sinon = _interopRequireDefault(require("sinon"));

var _chalk = _interopRequireDefault(require("chalk"));

var _util = _interopRequireDefault(require("util"));

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const muters = new Map();
const loggerKeys = new Map();
let loggerKeyCounter = 0;

function key(logger, method) {
  let loggerKey = loggerKeys.get(logger);

  if (!loggerKey) {
    loggerKeyCounter++;
    loggerKey = `logger${loggerKeyCounter}`;
    loggerKeys.set(logger, loggerKey);
  }

  return `${loggerKey}_${method}`;
}

function formatter(logger, method) {
  if (logger === console && ['log', 'info', 'warn', 'error'].includes(method)) {
    return _util.default.format;
  } else if ([process.stdout, process.stderr].includes(logger) && method === 'write') {
    return (chunk, encoding) => chunk.toString(encoding);
  } else {
    return (...args) => args.join(' ');
  }
}

function endString(logger, method) {
  if (logger === console && ['log', 'info', 'warn', 'error'].includes(method)) {
    return '\n';
  } else if ([process.stdout, process.stderr].includes(logger) && method === 'write') {
    return '';
  } else {
    return '\n';
  }
}

function unmuter(logger, method) {
  return () => {
    const func = logger[method];

    if (func.restore && func.restore.sinon) {
      func.restore();
    }
  };
}

const _isMuting = Symbol();

const _isCapturing = Symbol();

const _unmute = Symbol();

class SimpleMuter extends _events.default {
  constructor(logger, method) {
    super();
    let muter = muters.get(key(logger, method));

    if (muter) {
      return muter;
    }

    muter = this;
    const properties = {
      logger: {
        value: logger
      },
      method: {
        value: method
      },
      original: {
        value: logger[method]
      },
      boundOriginal: {
        value: logger[method].bind(logger)
      },
      format: {
        value: formatter(logger, method)
      },
      endString: {
        value: endString(logger, method)
      },
      [_unmute]: {
        value: unmuter(logger, method)
      },
      [_isMuting]: {
        value: false,
        writable: true
      },
      [_isCapturing]: {
        value: false,
        writable: true
      },
      isMuting: {
        get() {
          return this[_isMuting];
        },

        set(bool) {
          if (bool) {
            this[_isMuting] = true;
            this[_isCapturing] = false;
          } else {
            this[_isMuting] = false;
          }
        }

      },
      isCapturing: {
        get() {
          return this[_isCapturing];
        },

        set(bool) {
          if (bool) {
            this[_isMuting] = false;
            this[_isCapturing] = true;
          } else {
            this[_isCapturing] = false;
          }
        }

      },
      isActivated: {
        get() {
          if (logger[method].restore) {
            return true;
          } else {
            // Fix states in case logger was restored somewhere else
            this.isMuting = false;
            this.isCapturing = false;
            return false;
          }
        }

      }
    };
    Object.defineProperties(muter, properties);
    muters.set(key(logger, method), muter);
    return muter;
  }

  mute() {
    if (this.isActivated) {
      return;
    }

    this.isMuting = true;

    _sinon.default.stub(this.logger, this.method).callsFake((...args) => {
      this.emit('log', args, this);
    });
  }

  capture() {
    if (this.isActivated) {
      return;
    }

    this.isCapturing = true;

    _sinon.default.stub(this.logger, this.method).callsFake((...args) => {
      this.emit('log', args, this);
      this.boundOriginal(...args);
    });
  }

  unmute() {
    this[_unmute]();

    this.isMuting = false;
  }

  uncapture() {
    this[_unmute]();

    this.isCapturing = false;
  }

  print(nth) {
    if (this.isActivated) {
      if (nth >= 0) {
        const call = this.logger[this.method].getCalls()[nth];
        this.boundOriginal(...call.args);
      } else {
        const calls = this.logger[this.method].getCalls();
        calls.forEach(call => {
          this.boundOriginal(...call.args);
        });
      }
    }
  }

  getLog(nth, color) {
    if (this.isActivated) {
      let call = this.logger[this.method].getCalls()[nth];
      call = this.format(...call.args) + this.endString;

      if (!color && this.color) {
        color = this.color; // eslint-disable-line no-param-reassign
      }

      return color ? _chalk.default[color](call) : call;
    }
  }

  getLogs(options = {}) {
    if (this.isActivated) {
      const color = options.color;
      let format = options.format;
      let endString = options.endString;

      if (!format) {
        format = this.format;
      }

      if (!endString) {
        endString = this.endString;
      }

      let calls = this.logger[this.method].getCalls();
      calls = calls.map(call => {
        return format(...call.args) + endString;
      });
      calls = calls.join('');
      return color ? _chalk.default[color](calls) : calls;
    }
  }

  flush(options = {}) {
    if (!this.isActivated) {
      return;
    }

    const logs = this.getLogs(options);
    const calls = this.logger[this.method].getCalls();
    calls.forEach(call => {
      this.boundOriginal(...call.args);
    });

    this[_unmute]();

    if (this.isMuting) {
      this.mute();
    } else if (this.isCapturing) {
      this.capture();
    } else {
      throw new Error('Muter was neither muting nor capturing, ' + 'yet trying to remute/recapture after flushing');
    }

    return logs;
  }

  forget() {
    if (!this.isActivated) {
      return;
    }

    const logs = this.getLogs();

    this[_unmute]();

    if (this.isMuting) {
      this.mute();
    } else if (this.isCapturing) {
      this.capture();
    } else {
      throw new Error('Muter was neither muting nor capturing, ' + 'yet trying to remute/recapture after flushing');
    }

    return logs;
  }

}

var _default = SimpleMuter;
exports.default = _default;
module.exports = exports.default;