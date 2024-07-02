# cleanup-wrapper
Provide functions that leave a mess behind and break unit testing with some autocleaning capabilities

## Purpose

Considering `func` a dirty function that leaves some shared ressources/variables in an unwanted state because of an uncaught exception or some oversight in the design, `cleanWrapper(func, options)` returns a wrapped `func` that will restore the ressources/variables to their proper state after each run.

## Simple usage

In the following example, an identity method is poorly overridden and a side-effect snowballs on each call. Using cleanupWrapper with an `after` option, the side-effect is removed.

```js
import cleanupWrapper from 'cleanup-wrapper';

let obj = {id(x) {return x;}};
const id = obj.id;

function dirty(x) {
  const id = obj.id;
  obj.id = function(x) {
    return id('overridden:' + x);
  }
  return obj.id(x);
}

dirty('Hello'); // Returns 'overridden: Hello'
dirty('World'); // Returns 'overridden: overridden: World'
dirty('Hello'); // Returns 'overridden: overridden: overridden: Hello'
dirty('World'); // Returns 'overridden: overridden: overridden: overridden: World'

obj.id = id; // Restores obj

const clean = cleanupWrapper(dirty, {
  after() {
    obj.id = id;
  }
});

clean('Hello'); // Returns 'overridden: Hello'
clean('World'); // Returns 'overridden: World'
clean('Hello'); // Returns 'overridden: Hello'
clean('World'); // Returns 'overridden: World'
```

## Options

### Default options

* `before`: A function to be run prior to calling the wrapped function.
* `after`: A function that cleans up after calling the wrapped function, whether it threw an exception or not.

### Custom options

You can pass any custom option you like. They can be accessed within the optional functions `before` and `after` using the `this` keyword.

```js
import cleanupWrapper from 'cleanup-wrapper';

var hello = 'Hello';

function dirty() {
  hello = 'Bye';
  return hello;
}

const clean = cleanupWrapper(dirty, {
  hello, // Initialized with 'Hello'
  after() {
    hello = this.hello; // Restores to 'Hello'
  }
});

dirty() === 'Bye'; // true
hello === 'Bye'; // true

clean() === 'Bye'; // true
hello === 'Hello'; // true
```

## Convenience wrappers

### tmpDir(pathName, func)

tmpDir ensures that a directory is actually temporary. Before executing any function, it will check for the existence of the directory and throw an error if it finds it. Upon completion of the function or upon encountering an exception while running it, it will remove the tmp dir automatically.

As a convenience, `pathname` can actually be an array of pathnames.

```js
import {tmpDir} from 'cleanup-wrapper';

const dirName = '.tmp';

const dirty = function() {
  // Create dirName directory and do stuff in it
}

const clean = tmpDir(dirName, dirty);

clean(); // Executes dirty(), creating dirName, then removing it on completion or on exception
```

### chDir(pathName, func)

chDir allows to have a temporary working direction for your function and ensures that whatever happens the working directory will be changed back to its original value.

```js
import {chDir} from 'cleanup-wrapper';

const cwd = process.cwd();
const dirName = '.tmp';

const dirty = function() {
  process.chdir(process.cwd() + '/foo');
}

const clean = chDir(dirName, dirty);

// process.cwd() is cwd
dirty(); // process.cwd(): cwd -> cwd/foo
// process.cwd() is cwd/foo
clean(); // process.cwd(): cwd/foo -> .tmp -> ./tmp/foo -> cwd
// process.cwd() is cwd
```

### overrideMethod(object, methodName, newMethod, func)

overrideMethod allows to encapsulate a temporary method override. It will first override a specified method with some function passed as argument. Then it will run the code where the method should be overridden, and finally it will restore the method automatically.

```js
import {overrideMethod} from 'cleanup-wrapper';

const original = function() {
  console.log(...arguments);
  console.log(...arguments);
}

const log = console.log;
const overridden = overrideMethod(console, 'log', function() {
  log('overridden:', ...arguments);
}, original);

console.log('Hello'); // Prints 'Hello\n'
original('Hello'); // Prints 'Hello\nHello\n'
overridden('Hello'); // Prints 'overridden: Hello\noverridden: Hello\n'
console.log('Hello'); // Prints 'Hello\n'
```

## License

cleanup-wrapper is [MIT licensed](./LICENSE).

© 2016-2017 [Jason Lenoble](mailto:jason.lenoble@gmail.com)
