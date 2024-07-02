# muter

A node package to mute and/or capture console or other loggers' logs

  * [Basic usage](#basic-usage)
    * [Basic muting](#basic-muting)
    * [Basic capturing](#basic-capturing)
    * [Using options](#using-options)
      * [Available options](#available-options)
      * [Overriding options](#overriding-options)
    * [Clearing](#clearing)
  * [Using several Muters in parallel](#using-several-muters-in-parallel)
    * [Distinct Muters](#distinct-muters)
    * [Related Muters](#related-muters)
    * [Overlapping Muters](#overlapping-muters)
  * [Advanced usage](#advanced-usage)
    * [Coordinated muting/capturing](#coordinated-muting-capturing)
    * [Printing](#printing)
    * [Flushing](#flushing)
    * [Forgetting](#forgetting)
  * [CAVEAT](#caveat)
    * [Side-effects](#side-effects)
    * ['muted' and 'captured' convenience wrappers](#muted-and-captured-convenience-wrappers)
  * [Miscellaneous](#miscellaneous)
    * [Format strings](#format-strings)
    * [Handling hidden logging methods](#handling-hidden-logging-methods)
      * [gulp-util logger](#gulp-util-logger)
    * [Special arguments](#special-arguments)
  * [Full API](#full-api)
    * [Muter methods](#muter-methods)
    * [Utilities](#utilities)
  * [License](#license)


## Basic usage

Muter is a factory class generally taking two main arguments, the logger and the spied-on method name, plus an optional one used to help reformat the captured messages if desired.

### Basic muting

Using Muter can be as simple as writing the few lines:

```js
import Muter from 'muter';

const muter = new Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

const logs = muter.getLogs(); // Returns 'Lorem ipsum\n'

muter.unmute(); // The Muter stops muting console.log
```

Therefore a Muter does not only mute a specific logging method but **it also always captures what the muted method is expected to print.**

### Basic capturing

Muter can be used to capture seamlessly what a specific method of a logger is expected to print, that is to say without muting it. To do that, just call 'capture' instead of 'mute':

```js
import Muter from 'muter';

const muter = new Muter(console, 'log'); // Sets a Muter on console.log
muter.capture(); // The Muter starts capturing console.log

console.log('Lorem ipsum'); // console.log prints as usual

const logs = muter.getLogs(); // Returns 'Lorem ipsum\n'

muter.uncapture(); // The Muter stops capturing console.log
```

### Using options

The messages captured by a Muter can be altered:

```js
import Muter from 'muter';

const muter = new Muter(console, 'log', {
  color: 'magenta',
  format: (...args) => {
    return args.join(' • ');
  },
  endString: ' ▪▪▪'
}); // Sets a Muter on console.log with special formatting options
muter.mute(); // The Muter starts muting console.log

console.log('Lorem', 'ipsum'); // console.log prints nothing

const logs = muter.getLogs(); // Returns 'Lorem • ipsum ▪▪▪' in magenta

muter.unmute(); // The Muter stops muting console.log
```

But a Muter won't usually interfere with what is printed by the logging method when it is only captured and not muted altogether:

```js
import Muter from 'muter';

const muter = new Muter(console, 'log', {
  color: 'magenta',
  format: (...args) => {
    return args.join(' • ');
  },
  endString: ' ▪▪▪'
}); // Sets a Muter on console.log with special formatting options
muter.capture(); // The Muter starts capturing console.log

console.log('Lorem', 'ipsum'); // console.log prints as usual with no special formatting, that is to say 'Lorem ipsum\n'

const logs = muter.getLogs(); // Returns 'Lorem • ipsum ▪▪▪' in magenta

muter.uncapture(); // The Muter stops capturing console.log
```

#### Available options

* `color`: Allows to change the output color. If not provided, text will be printed in default stdout/stderr color (most likely white on black or black on white). Colors are as defined by the [chalk](https://github.com/chalk/chalk) module.
* `format`: Allows to reformat the arguments with which logger[methodName] is called. format is a function taking the arguments passed to the logging method and returning a string. See [Using options](#using-options) for an example.
* `endString`: Helps change how the output string resulting from the call to logger[methodName] is terminated. It is simply '' or '\n' by default, but could be more sophisticated. See [Using options](#using-options) as an example.
* `logger`: Not used when calling factory, but by methods 'getLogs' and 'flush'. When the Muter references several pairs (logger, methodName), this option in conjunction with the following one allows to precise which logging channel to access. See [Coordinated muting/capturing](#coordinated-mutingcapturing) for an example.
* `method`: Not used when calling factory, but by methods 'getLogs' and 'flush'. When the Muter references several pairs (logger, methodName), this option in conjunction with the previous one allows to precise which logging channel to access. See [Coordinated muting/capturing](#coordinated-mutingcapturing) for an example.

#### Overriding options

The options that a Muter was set with can be overridden when recovering the logged messages:

```js
import Muter from 'muter';

const muter = new Muter(console, 'log', {
  color: 'magenta',
  format: (...args) => {
    return args.join(' • ');
  },
  endString: ' ▪▪▪'
}); // Sets a Muter on console.log with special formatting options
muter.mute(); // The Muter starts muting console.log

console.log('Lorem', 'ipsum'); // console.log prints nothing

var logs = muter.getLogs(); // Returns 'Lorem • ipsum ▪▪▪' in magenta

logs = muter.getLogs({
  color: 'cyan',
  endString: ' ▪'
}); // Returns 'Lorem • ipsum ▪' in cyan

logs = muter.getLogs({
  format: (...args) => {
   return args.join(' ••• ');
  }
}); // Returns 'Lorem ••• ipsum ▪▪▪' in magenta

muter.unmute(); // The Muter stops muting console.log
```

### Clearing

To clear a Muter, that is to say to both forget the captured logs and stop muting/capturing, you just call 'unmute' or 'uncapture'.

```js
import Muter from 'muter';

const muter = new Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

var logs = muter.getLogs(); // Returns 'Lorem ipsum\n'

muter.unmute(); // The Muter stops muting console.log

logs = muter.getLogs(); // Returns nothing

console.log('dolor sit amet'); // console.log prints as expected

logs = muter.getLogs(); // Returns nothing
```

## Using several Muters in parallel

### Distinct Muters

Muters can be used in parallel. They can't interfere with one another as long as they were not set with the same pair (logger, methodName).

In other words, two pairs can share the same logger, as in the following example:

```js
import Muter from 'muter';

const logMuter = new Muter(console, 'log'); // Sets a Muter on console.log
const errorMuter = new Muter(console, 'error'); // Sets a Muter on console.error

logMuter.mute(); // logMuter starts muting console.log
errorMuter.mute(); // errorMuter starts muting console.error

console.log('Lorem'); // console.log prints nothing
console.error('ipsum'); // console.error prints nothing
console.error('dolor'); // console.error prints nothing
console.log('sit'); // console.log prints nothing

const logMessage = logMuter.getLogs(); // Returns 'Lorem\nsit\n'
const errorMessage = errorMuter.getLogs(); // Returns 'ipsum\ndolor\n'

logMuter.unmute(); // logMuter stops muting console.log
errorMuter.unmute(); // errorMuter stops muting console.error
```

Or they can share the same logging method, as in:

```js
import Muter from 'muter';

const stdoutWrite = new Muter(process.stdout, 'write'); // Sets a Muter on process.stdout.write
const stderrWrite = new Muter(process.stderr, 'write'); // Sets a Muter on process.stderr.write

process.stdout.write === process.stderr.write; // true

stdoutWrite.mute(); // stdoutWrite starts muting process.stdout.write
stderrWrite.mute(); // stderrWrite starts muting process.stderr.write

process.stdout.write === process.stderr.write; // false

process.stdout.write('Lorem'); // process.stdout.write prints nothing
process.stderr.write('ipsum'); // process.stderr.write prints nothing
process.stderr.write('dolor'); // process.stderr.write prints nothing
process.stdout.write('sit'); // process.stdout.write prints nothing

const outMessage = stdoutWrite.getLogs(); // Returns 'Loremsit'
const errMessage = stderrWrite.getLogs(); // Returns 'ipsumdolor'

stdoutWrite.unmute(); // stdoutWrite stops muting process.stdout.write
stderrWrite.unmute(); // stderrWrite stops muting process.stderr.write
```

Of course, if two Muters share neither logger nor method, they'll a fortiori work alongside seamlessly.

### Related Muters

Internally, Muters are singletons. They have a one-to-one correspondence to pairs (logger, methodName), as those are generally global anyway.

So the first time you set a Muter by calling the factory, it will create a Muter object. Any other time you call the factory with the same pair (logger, methodName), it will return that object (pure call) or a wrapper around it (call with a third options argument).

The advantage is that you can use the same Muter with different options. Muting one single wrapper will mute the logging method, but all wrappers will have to be unmuted to unmute that logging method. Moreover each wrapper captures the output from the moment it is muted and forgets everything from the moment it is unmuted. They have therefore different logging histories, and formatted differently.

But the master singleton returned by the factory called with no options keeps track of everything from the first muting to the last unmuting. That full history has no special custom format.

```js
import Muter from 'muter';

const log1 = new Muter(console, 'log', {
  color: 'blue'
}); // Sets a Muter on console.log; log1 is wrapper around the actual Muter
const log2 = new Muter(console, 'log', {
  color: 'red'
}); // Associates another wrapper with different options to the same Muter
const log = new Muter(console, 'log'); // The actual Muter, with no special options

log1.mute(); // log1 starts muting console.log

console.log('Lorem'); // console.log prints nothing
console.log('ipsum'); // console.log prints nothing

var logMessage = log.getLogs(); // Returns 'Lorem\nipsum\n' in default color
var logMessage1 = log1.getLogs(); // Returns 'Lorem\nipsum\n' in blue
var logMessage2 = log2.getLogs(); // Returns nothing

log2.mute(); // log2 starts muting too

console.log('dolor'); // console.log prints nothing

logMessage = log.getLogs(); // Returns 'Lorem\nipsum\ndolor\n' in default color
logMessage1 = log1.getLogs(); // Returns 'Lorem\nipsum\ndolor\n' in blue
logMessage2 = log2.getLogs(); // Returns 'dolor\n' in red

log1.unmute(); // log1 stops muting console.log

console.log('sit'); // console.log prints nothing because log2 is still muting

logMessage = log.getLogs(); // Returns 'Lorem\nipsum\ndolor\nsit\n' in default color
logMessage1 = log1.getLogs(); // Returns nothing
logMessage2 = log2.getLogs(); // Returns 'dolor\nsit\n' in red

log2.unmute(); // log2 stops muting console.log, which is fully unmuted

console.log('amet'); // console.log prints 'amet'

logMessage = log.getLogs(); // Returns nothing
logMessage1 = log1.getLogs(); // Returns nothing
logMessage2 = log2.getLogs(); // Returns nothing
```

### Overlapping Muters

Overlapping Muters are coordinated Muters (see [Advanced usage](#advanced-usage)) that share one or more (logger, methodName) pairs.

You have to take special care when sharing logging methods across Muters as mismatch may appear when muting with one and unmuting with the other.

```js
import Muter from 'muter';

const muter1 = new Muter(
  [console, 'log'],
  [console, 'warn']
); // Sets a Muter on console.log and console.warn

const muter2 = new Muter(
  [console, 'warn'],
  [console, 'error']
); // Shares the Muter on console.warn and sets a Muter on console.error

muter1.mute(); // muter1 mutes console.log and console.warn

console.log('Lorem ipsum'); // console.log prints nothing
console.warn('dolor'); // console.warn prints nothing
console.error('sit amet'); // console.error prints as expected

muter1.getLogs(); // Returns 'Lorem ipsum\ndolor\n'
muter2.getLogs(); // Returns nothing

muter2.mute(); // muter2 mutes console.error and starts recording console.warn

muter2.getLogs(); // Returns ''
muter2.getLogs({
  logger: console,
  method: 'warn'
}); // Returns '' because no history yet for console.warn since the time of muting
muter1.getLogs({
  logger: console,
  method: 'warn'
}): // Returns 'dolor\n';

muter1.unmute(); // Unmutes console.log but not console.warn (still muted by muter2), now being in an inconsistent state
muter2.unmute(); // Unmutes console.warn and console.error, putting back muter1 in a consistent state
```

## Advanced usage

Muters can be used in parallel as in [Using several Muters in parallel](#using-several-muters-in-parallel), but they actually can be coordinated, that is to say that their states can be changed simultaneously without having to micromanage them.

A special construct is provided to achieve this, using the same factory interface, but instead of calling it with a triplet (logger, methodName, options), you call it with a series of array arguments in a row, each containing a logger reference, a method name and optionally the options object.

### Coordinated muting/capturing

Using the Muter factory with a series of array arguments, we can set up basic coordination between Muters. For example we can mute and unmute several logging methods simultaneously:

```js
import Muter from 'muter';

const muter = new Muter(
  [console, 'log'],
  [console, 'warn'],
  [console, 'error']
); // Sets a Muter on console.log, console.warn and console.error

muter.mute(); // The Muter mutes simultaneously console.log, console.warn and console.error

console.log('Lorem'); // console.log prints nothing
console.warn('ipsum'); // console.warn prints nothing
console.log('dolor'); // console.log prints nothing
console.error('sit'); // console.error prints nothing
console.log('amet'); // console.log prints nothing

const logMessage = muter.getLogs({
  logger: console,
  method: 'log'
}); // Returns 'Lorem\ndolor\namet\n'
const warnMessage = muter.getLogs({
  logger: console,
  method: 'warn'
}); // Returns 'ipsum\n'
const errorMessage = muter.getLogs({
  logger: console,
  method: 'error'
}); // Returns 'sit\n'
const message = muter.getLogs(); // Returns 'Lorem\nipsum\ndolor\nsit\namet\n'

muter.unmute(); // The Muter unmutes simultaneously console.log, console.warn and console.error
```

Coordinated capturing is pretty much the same, by calling 'capture' instead of 'mute' and 'uncapture' instead of 'unmute'.

### Printing

With 'getLogs', you can return whatever was logged from muting to unmuting. But you can also print it on screen with method 'print'.

```js
import Muter from 'muter';

const muter = new Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

muter.print(); // Prints 'Lorem ipsum\n'

console.log('dolor sit amet'); // console.log prints nothing

muter.print(); // Prints 'Lorem ipsum\ndolor sit amet\n'
muter.print(0); // Prints 'Lorem ipsum\n'
muter.print(1); // Prints 'dolor sit amet\n'

muter.unmute(); // The Muter stops muting console.log
```

### Flushing

First you 'mute'/'capture', last you 'unmute'/'uncapture'. Inbetween, you log stuff and if you want, you access the log history with 'getLogs'. But the log history is whatever was logged from muting to unmuting. You may want to get it by chunks, especially if you access it several times before unmuting. But you can also 'flush' the logs. Calling that method doesn't affect the state of the Muter, but it prints the current history before clearing it.

```js
import Muter from 'muter';

const muter = new Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

muter.flush(); // Prints 'Lorem ipsum\n'
muter.flush(); // Prints nothing

console.log('dolor sit amet'); // console.log prints nothing

muter.flush(); // Prints 'dolor sit amet\n'
muter.flush(); // Prints nothing

muter.unmute(); // The Muter stops muting console.log
```

### Forgetting

Method 'forget' flushes without printing on screen.

```js
import Muter from 'muter';

const muter = new Muter(console, 'log'); // Sets a Muter on console.log
muter.mute(); // The Muter starts muting console.log

console.log('Lorem ipsum'); // console.log prints nothing

var logs = muter.getLogs(); // Returns 'Lorem ipsum\n'
muter.forget(); // Forgets history
logs = muter.getLogs(); // Returns ''

console.log('dolor sit amet'); // console.log prints nothing

logs = muter.getLogs(); // Returns 'dolor sit amet\n'
muter.forget(); // Forgets history
logs = muter.getLogs(); // Returns ''

muter.unmute(); // The Muter stops muting console.log
```

## CAVEAT

### Side-effects

Muting or capturing logs can have unwanted repercutions throughout your running process as, most of the time, standard logging functions such as `console.log` or `process.stdout.write` are temporarily overridden.

If you forget to unmute your Muter whenever you don't need it anymore, or if you encounter an exception from which your process recovers without unmuting, you will most likely get plagued with random incomplete logging messages.

### 'muted' and 'captured' convenience wrappers

In order to mitigate those side-effects, two function wrappers are provided that will take care of cleaning up as soon as you're done with muting or if an unhandled exception is thrown: `muted` and `captured`.

```js
import Muter, {muted, captured} from 'muter';

const muter = new Muter(console);

const func = function(...args) {
  console.log(args[0].toString());
  console.error(args[1].toString());
  console.info(args[2].toString());
  return muter.getLogs();
};

const safelyMutedFunc = muted(muter, func);
const safelyCapturedFunc = captured(muter, func);

const res1 = safelyMutedFunc('lorem', 'ipsum', 'dolor', 'sit', 'amet'); // Prints nothing: muter is muting
const res2 = safelyCapturedFunc('lorem', 'ipsum', 'dolor', 'sit', 'amet'); // Prints 'lorem\nipsum\ndolor\n';

res1 === res2; // true
res2 === 'lorem\nipsum\ndolor\n'; // true: muter was capturing
res2 === muter.getLogs(); // false: muter is no longer muting nor capturing

try {
  safelyMutedFunc('lorem'); // Prints nothing, throws error
} catch(e) {
  console.log(e); // Prints error as expected
}

try {
  safelyCapturedFunc('lorem'); // Prints 'lorem', throws error
} catch(e) {
  console.log(e); // Prints error as expected
}
```

## Miscellaneous

### Format strings

Muter supports the same format strings as console in [Node.js](https://nodejs.org) as it utilizes util.format from [util module](https://nodejs.org/api/util.html#util_util_format_format) under the hood.

```js
import Muter from 'muter';

const muter = new Muter(console, 'log'); // Sets a Muter on console.log

muter.mute(); // Mutes console.log

for (let i = 1; i < 4; i++) {
  console.log('%d) %s%d', i, 'message', i); // console.log prints nothing
}

const logs = muter.getLogs(); // Returns '1) message1\n2) message2\n3) message3\n'

muter.unmute(); // Unmutes console.log
```

But if you specify a custom formatter as an option, it's your responsability to handle the special formatting strings.

### Handling hidden logging methods

Some fancy loggers print on interleaved channels. To mute such loggers, you need first to identify all those channels and then set a coordinating Muter on them (see [Advanced usage](#advanced-usage)), as in the following example:

```js
import Muter from 'muter';

function log() {
  console.info('>>>>');
  console.log(...arguments);
  console.info('<<<<');
} // A custom logging function printing on interleaved console.info and console.log

const muter = new Muter(
  [console, 'info'],
  [console, 'log']
); // Sets a Muter on console.info and console.log

muter.mute(); // Mutes console.info and console.log, therefore muting the custom logging function 'log'

log('Lorem', 'ipsum'); // Prints nothing
log('dolor', 'sit', 'amet'); // Prints nothing

const logs = muter.getLogs(); // Returns '>>>>\nLorem ipsum\n<<<<\n>>>>\ndolor sit amet\n<<<<\n'

muter.unmute(); // Unmutes console.info and console.log, therefore unmuting  the custom logging function 'log'
```

#### gulp-util logger

gulp-util 'log' method is such a fancy logger. The two interleaved channels are process.stdout.write and console.log. But you may use a special construct directly, see [Special arguments](#special-arguments).

### Special arguments

As a convenience, you may call the Muter factory with special arguments to have common Muters be set.

```js
import Muter from 'muter';

const muter1 = new Muter(process); // Sets Muters on process.stdout.write and process.stderr.write, therefore allowing to silence the whole process
const muter2 = new Muter(console); // Sets Muters on all four logging methods of console
```

## Full API

### Muter methods

* `new Muter(logger, methodName [, options])`: Muter is the default import of the 'muter' module. With no options, this construct returns a singleton associated with the pair (logger, methodName), able to mute/unmute it at will (see [Basic muting](#basic-muting)). Options are explained in [Using options](#using-options).
When options are set, the method returns a wrapper around the above singleton.
* `Muter(Array(logger1, methodName1 [, options1]), Array(logger2, methodName2 [, options2])[, ...])`: This construct improves on the previous one, allowing to set coordinated Muters on several pairs (logger, methodName) (see [Coordinated muting/capturing](#coordinated-mutingcapturing)).
* `mute()`: Mutes (and captures) all pairs (logger, methodName) referenced by the Muter. See [Basic muting](#basic-muting) and  [Coordinated muting/capturing](#coordinated-mutingcapturing).
* `unmute()`: Unmutes all pairs (logger, methodName) referenced by the Muter and resets logging history.
* `capture()`: Captures all pairs (logger, methodName) referenced by the Muter. See [Basic capturing](#basic-capturing) and  [Coordinated muting/capturing](#coordinated-mutingcapturing).
* `uncapture()`: Uncaptures all pairs (logger, methodName) referenced by the Muter and resets logging history.
* `print([nth])`: Prints the whole logging history (no argument) or the nth logged message by one of the muted/captured pair (logger, methodName), see [Printing](#printing).
* `getLogs([options])`: Returns the whole logging history since last muting/capturing/flushing. options override those set on the pair (logger, methodName) on creation (see [Overriding options](#overriding-options)).
* `flush([options])`: Like 'getLogs([options])', returns the whole logging history, but also both prints it and resets it, see [Flushing](#flushing).
* `forget()`: Returns and resets the logging history, but don't print it, see [Forgetting](#forgetting).

### Utilities

* `muted(muter, func)`: Returns a wrapper around function `func` that'll first mute the logging methods handled by `muter`, then run `func` (that supposedly calls the aforementioned logging methods during its run) and finally unmute the logging methods, either upon returning or upon catching an exception. See ['muted' and 'captured' convenience wrappers](#muted-and-captured-convenience-wrappers) for an example.
* `captured(muter, func)`: Returns a wrapper around function `func` that'll first capture the logging methods handled by `muter`, then run `func` (that supposedly calls the aforementioned logging methods during its run) and finally unmute the logging methods, either upon returning or upon catching an exception. See ['muted' and 'captured' convenience wrappers](#muted-and-captured-convenience-wrappers) for an example.


## License

muter is [MIT licensed](./LICENSE).

© 2016-2019 [Jason Lenoble](mailto:jason.lenoble@gmail.com)

