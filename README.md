# JSLinter - JSLint for Node.js

[![npm version](https://img.shields.io/npm/v/jslinter.svg)][npm]

-   [Introduction](#introduction)
-   [Why another JSLint package for Node.js](#why-another-jslint-package-for-node-js)
-   [JavaScript API](#javascript-api)
-   [Command-line](#command-line)

## Introduction

**JSLinter** brings the [JSLint][jslint] code quality tool to the
[Node.js][nodejs] environment. It's easy to install, using `npm install
jslinter`, and has no dependencies. **JSLinter** comes in two flavors: a
[command-line tool](#command-line) named `jslint`, useful for checking files
from inside the terminal command line, and a [Node.js module](#javascript-api).

## Why another JSLint package for Node.js

Douglas Crockford developed [JSLint][jslint] as a web application. While there
are many `npm` packages that expose [JSLint][jslint] as a [Node.js][nodejs]
module, we believe that **JSLinter** has a number of advantages:

-   Constantly up-to-date with the upstream [JSLint repository][jslint-repo].
-   It delivers the original, unmodified [API](#javascript-api).
-   No extra dependencies.
-   It passes JSLint checks.

## JavaScript API

```javascript
var jslint = require('jslinter');

result = jslint(source, options, globals);
```

The `jslint` object imported above is the function described
[here][jslint-func].

The `source` parameter is the JavaScript code that you want to check, and it can
be provided in the form of a string or an array of strings, one for each line of
code.

`options` is the object containing the options for the analysis. Options are
specified through the following keys:

-   `bitwise`
-   `browser`
-   `couch`
-   `devel`
-   `es6`
-   `eval`
-   `for`
-   `fudge`
-   `maxerr`
-   `maxlen`
-   `node`
-   `this`
-   `white`

`globals` is a array of strings, naming the global variables used by the
program.

The `options` and `globals` parameter are both optional.

`result` is an object representing the result of the analysis, and it's
described in details [here][jslint-func].

## Command-line

To use **JSLinter** from a terminal, simply run the `jslint` command passing the
list of files you want to check, the standard [JSLint][jslint] options
described [here][jslint-help], and the command-line specific flags:

```shell
jslint [FLAGS or OPTIONS] file1.js [file2.js [...]]
```

Additionally `jslint` reads options from JSON configuration files named
`.jslintrc`. First it reads the configuration file in the user's home directory,
`~/.jslintrc`. Then, if the file to be checked is located below the current
working directory hierarchy, it reads all the configuration files located along
the way from the current working directory to the directory where the file is
located. For example, if you are the directory `my/project` and run `jslint
foo/bar/baz.js`, the tool will read the following files in this order:

-   `~/.jslintrc`
-   `my/project/.jslintrc`
-   `my/project/foo/.jslintrc`
-   `my/project/foo/bar/.jslintrc`

If the file is not located in the hierarchy below the current working directory,
then only `~/.jslintrc` is read. Options deeper in the hierarchy have
precedence. Command line options are applied last, thus overriding any other
configuration.

Options for the command line and configuration files follow the same naming as
those described in the [API](#javascript-api) section. `jslint` is very strict
in the way it parses configuration files and command line options; this is to
avoid that mistyped options get silently ignored. Command line options must
follow the exact grammar specified below:

-   `--bitwise[={true|false}]`
-   `--browser[={true|false}]`
-   `--couch[={true|false}]`
-   `--devel[={true|false}]`
-   `--es6[={true|false}]`
-   `--eval[={true|false}]`
-   `--for[={true|false}]`
-   `--fudge[={true|false}]`
-   `--maxerr=<NUM>`
-   `--maxlen=<NUM>`
-   `--node[={true|false}]`
-   `--this[={true|false}]`
-   `--white[={true|false}]`

If an option that takes a Boolean value is not provided a value, it assumes
`true`, so, for example, `--foo` is equivalent to `--foo=true`. Passing any
other option will cause an error. Similarly, each JSON configuration files
cannot contain options other than those specified in the [API](#javascript-api)
section, and they must have the correct value type, e.g.:

```json
{
    "fudge": true,
    "maxlen": 80,
    "node": true
}
```

`jslint` also recognize some command-line specific flags:

-   `--raw`: output the report as raw JSON, useful when the output is expected
    to be parsed by another tool. The format is an array of objects, one for
    each input file, containing the following fields:

    -   `file`: the name of the input file
    -   `option`: JSLint option object
    -   `stop`: true if JSLint was not able to process the entire file
    -   `warnings`: the array of warning objects

[jslint]: http://www.jslint.com/ "The JavaScript Code Quality Tool"
[jslint-func]: http://www.jslint.com/function.html "The jslint Function"
[jslint-help]: http://www.jslint.com/help.html "Help"
[jslint-repo]: https://github.com/douglascrockford/JSLint "douglascrockford/JSLint"
[npm]: https://www.npmjs.com/package/jslinter "JSLinter page on npmjs.com"
[nodejs]: https://nodejs.org/ "Node.js"
