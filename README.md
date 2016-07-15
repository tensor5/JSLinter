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
const JSLinter = require('jslinter');
```

`JSLinter` is the top-level object; its members are described below.

```javascript
JSLinter.jslint(source, options, globals);
```

This is the function described [here][jslint-func].

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
-   `multivar`
-   `node`
-   `single`
-   `this`
-   `white`

`globals` is a array of strings, naming the global variables used by the
program.

The `options` and `globals` parameter are both optional.

`jslint` returns an object representing the result of the analysis, and it's
described in details [here][jslint-func].

```javascript
JSLinter.jslintEdition
```

is the edition (a date string) of JSLint used internally.

```javascript
JSLinter.jslintFile(files, extraArgs)
```

It returns the `Promise` of sequentially reading files specified in the `files`
array and returning an array of JSLint reports for those files. If `files` is a
string instead of an array, a single file is read and a single report is
returned. For options `jslintFile` reads the `.jslintrc` file in the user's home
directory, plus for each file it reads all `.jslintrc` found along the way from
the `projectDir` (see description below) to the current file being analyzed
(this behaviour is the third form of `readConf` described below). The format of
the the objects returned by `jslintFile` depends on the `callback` option
described below.

`extraArgs` is an object with the following members:

-   `callback`: an optional `Promise` to run after after each file in the array.
    The argument of the callback is an object with two properties:

    -   `pathname`: the pathname of the file analyzed
    -   `report`: the JSLint report.

    The return value of the callback is used to produce the output of
    `jslintFile`. If this option is omitted, the identity function is used.

-   `globals`: the `globals` argument passed to `jslint`.

-   `options`: the `options` argument passed to `jslint`. These options have
    priority over all other configurations found in `.jslintrc` files.

-   `projectDir`: the root directory of the project, where the top-level
    `.jslintrc` configuration file is located. If omitted, the current working
    directory is used.

-   `shaBang`: remove the initial sha-bang (e.g. `#!/usr/bin/env node`) before
    feeding the file to `jslint`.

```javascript
JSLinter.readConf(pathname, oldConf)

JSLinter.readConf([path1, path2, ..., pathN], oldConf)

JSLinter.readConf(projectDir, subpath, oldConf)
```

It returns the `Promise` of reading configuration files and returning an option
object that updates the `oldConf`. There are three forms of `readConf`. The
first one just reads one single file. The second reads a list of configuration
files sequentially and update the configuration object each time:

```javascript
readConf([path1, path2, path3], oldConf) === readConf(path3, readConf(path2, readConf(path1, oldConf)))
```

The third form reads all the configuration files that it finds on the way from
`projectDir` to `subpath` and update the configuration object each time:

```javascript
readConf("/a/b", "/a/b/c/d", oldConf) === readConf("/a/b/c/d", readConf("/a/b/c", readConf("/a/b", oldConf)))
```

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
-   `--multivar[={true|false}]`
-   `--node[={true|false}]`
-   `--single[={true|false}]`
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
    to be parsed by another tool. Unless the `--version` flag is used, the
    format is an array of objects, one for each input file, containing the
    following fields:

    -   `file`: the name of the input file
    -   `option`: JSLint option object
    -   `stop`: true if JSLint was not able to process the entire file
    -   `warnings`: the array of warning objects

    If the `--raw` flag is used together with `--version`, the format is:

    -   `version`: the version of JSLinter
    -   `jslintEdition`: the edition of JSLint

-   `--sha-bang`: ignore the first line of input if it begins with `#!`.

-   `--version`: print version and exit. If used together with `--raw`, the
    output is in JSON format (see `--raw` above).

[jslint]: http://www.jslint.com/ "The JavaScript Code Quality Tool"
[jslint-func]: http://www.jslint.com/function.html "The jslint Function"
[jslint-help]: http://www.jslint.com/help.html "Help"
[jslint-repo]: https://github.com/douglascrockford/JSLint "douglascrockford/JSLint"
[npm]: https://www.npmjs.com/package/jslinter "JSLinter page on npmjs.com"
[nodejs]: https://nodejs.org/ "Node.js"
