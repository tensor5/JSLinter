import optErr from "optionErrors";

function parseCommandLineArgs(argv) {
    "use strict";
    var key;
    var match;
    var notStop = true;
    var num;
    var optRegEx = /^--([^\s=]+)(?:=(\S*))?$/;
    var value;

    return argv.reduce(function (conf, arg) {
        if (notStop) {
            if (arg === "--") {
                notStop = false;
                return conf;
            }

            match = arg.match(optRegEx);
            if (match) {
                key = match[1];
                value = match[2];
                switch (key) {
                case "bitwise":
                case "browser":
                case "couch":
                case "devel":
                case "es6":
                case "eval":
                case "for":
                case "fudge":
                case "node":
                case "this":
                case "white":
                    switch (value) {
                    case "true":
                    case undefined:
                        conf.options[key] = true;
                        break;
                    case "false":
                        conf.options[key] = false;
                        break;
                    default:
                        optErr.notBool(key);
                    }
                    return conf;
                case "maxerr":
                case "maxlen":
                    num = Number.parseInt(value);
                    if (Number.isNaN(num)) {
                        optErr.notNum(key);
                    }
                    conf.options[key] = num;
                    return conf;
                case "raw":
                case "sha-bang":
                    if (value !== undefined) {
                        optErr.unexpectedValue(key);
                    }
                    conf.flags[key] = true;
                    return conf;
                default:
                    optErr.notKnown(key);
                }
            }
        }

        conf.filePaths.push(arg);
        return conf;
    }, {
        filePaths: [],
        flags: {
            raw: false,
            "sha-bang": false
        },
        options: {}
    });
}

export default parseCommandLineArgs;
