/*jslint
    node
*/

/*property
    HOME, USERPROFILE, assign, bind, callback, catch, code, concat, cwd,
    dirname, edition, env, exports, forEach, freeze, globals, isArray, join,
    jslint, jslintEdition, jslintFile, keys, options, parse, pathname,
    platform, projectDir, readConf, readFile, reduce, relative, report,
    resolve, sep, shaBang, slice, split, startsWith, then
*/

"use strict";

const fs = require("fs");
const path = require("path");

const jslint = require("./lib/jslint");

function parseConfigurations(oldConfObj, str) {
    const newConfObj = JSON.parse(str);

    Object.keys(newConfObj).forEach(function isValidOption(key) {
        switch (key) {
        case "bitwise":
        case "browser":
        case "couch":
        case "devel":
        case "es6":
        case "eval":
        case "for":
        case "fudge":
        case "multivar":
        case "node":
        case "single":
        case "this":
        case "white":
            if (typeof newConfObj[key] !== "boolean") {
                throw new Error("'" + key + "' must have a Boolean value.");
            }
            break;
        case "maxerr":
        case "maxlen":
            if (typeof newConfObj[key] !== "number") {
                throw new Error("'" + key + "' must have a numeric value.");
            }
            break;
        default:
            throw new Error("Unexpected option: '" + key + "'.");
        }
    });

    if (oldConfObj && typeof oldConfObj === "object") {
        return Object.assign({}, oldConfObj, newConfObj);
    }

    return newConfObj;
}

const confFile = ".jslintrc";

function readFile(filename, options) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, options, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// 1. readConf(pathname, oldConf)
//
//   Promise to read "pathname" and use it to update oldConf.
//   If "pathname" is a directory, read "pathname/.jslintrc" instead.
//
// 2. readConf([path1, path2, path3], oldConf)
//
//   Same as readConf(path3, readConf(path2, readConf(path1, oldConf)))
//
// 3. readConf("/a/b", "/a/b/c/d", oldConf)
//
//   Same as readConf("/a/b/c/d", readConf("/a/b/c", readConf("/a/b", oldConf)))
function readConf(pathname, pathOrConf, conf) {
    if (typeof pathOrConf === "string") {  // pathOrConf is a path
        const splitPath = path.relative(pathname, pathOrConf).split(path.sep);

        // pathOrConf is not in pathname subtree.
        if (splitPath[0] === "..") {
            return Promise.resolve(conf);
        }

        // pathname is the same as pathOrConf.
        if (splitPath[0] === "") {
            return readConf(pathname, conf);
        }

        // pathOrConf is in pathname subtree.
        return readConf(
            splitPath.reduce(
                (prev, elem, ix) => prev.concat(path.join(prev[ix], elem)),
                [pathname]
            ),
            conf
        );
    }

    // pathOrConf is a configuration object
    return Array.isArray(pathname)
        ? pathname.reduce(  // array
            (prom, path) => prom.then(readConf.bind(undefined, path)),
            Promise.resolve(pathOrConf)
        )
        : readFile(pathname, "utf8")
            .catch(function (err) {
                if (err.code === "EISDIR") {
                    return readFile(path.join(pathname, confFile), "utf8");
                }
                throw err;
            })
            .then(parseConfigurations.bind(undefined, pathOrConf))
            .catch(function (err) {
                if (err.code === "ENOENT") {
                    return pathOrConf;
                }
                throw err;
            });
}

const homeDir = process.platform !== "win32"
    ? process.env.HOME
    : process.env.USERPROFILE;

// extraArgs = {
//     callback: Function,
//     globals: Array,
//     options: Object,
//     shaBang: Boolean
// }
function jslintFile(file, extraArgs) {
    return readConf(homeDir, {})
        .then(function (homeConf) {
            if (Array.isArray(file)) {
                return file.reduce(function (prom, file) {
                    return prom.then(function (oldReport) {
                        return jslintFile(file, extraArgs)
                            .then(function (newReport) {
                                return oldReport.concat(newReport);
                            });
                    });
                }, Promise.resolve([]));
            }
            return readFile(file, "utf8")
                .then(function (data) {
                    const opts = (
                        typeof extraArgs === "object" && extraArgs !== null
                    )
                        ? extraArgs
                        : {};
                    const projectDir = opts.projectDir || process.cwd();
                    return readConf(projectDir, path.dirname(file), homeConf)
                        .then(function (conf) {
                            const newConf = Object.assign(
                                {},
                                conf,
                                opts.options
                            );
                            const lines = Array.isArray(data)
                                ? data
                                : data.split(/\n|\r\n?/);
                            const sb = opts.shaBang
                                ? lines[0].startsWith("#!")
                                    ? [""].concat(lines.slice(1))
                                    : lines
                                : lines;
                            const report = {
                                pathname: file,
                                report: jslint(sb, newConf, opts.globals)
                            };

                            return typeof opts.callback === "function"
                                ? opts.callback(report)
                                : report;
                        });
                });
        });
}

module.exports = Object.freeze({
    jslint: jslint,
    jslintEdition: jslint([]).edition,
    jslintFile: jslintFile,
    readConf: readConf
});
