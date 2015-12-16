import optErr from 'optionErrors';

function parseCommandLineArgs(argv) {
    'use strict';
    var key,
        match,
        notStop = true,
        num,
        optRegEx = /^--([^\s=]+)(?:=(\S*))?$/,
        value;

    return argv.reduce(function (conf, arg) {
        if (notStop) {
            if (arg === '--') {
                notStop = false;
                return conf;
            }

            match = arg.match(optRegEx);
            if (match) {
                key = match[1];
                value = match[2];
                switch (key) {
                case 'bitwise':
                case 'browser':
                case 'couch':
                case 'devel':
                case 'es6':
                case 'eval':
                case 'for':
                case 'fudge':
                case 'node':
                case 'this':
                case 'white':
                    switch (value) {
                    case 'true':
                    case undefined:
                        conf.options[key] = true;
                        break;
                    case 'false':
                        conf.options[key] = false;
                        break;
                    default:
                        optErr.notBool(key);
                    }
                    return conf;
                case 'maxerr':
                case 'maxlen':
                    num = Number.parseInt(value);
                    if (Number.isNaN(num)) {
                        optErr.notNum(key);
                    }
                    conf.options[key] = num;
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
        options: {}
    });
}

export default parseCommandLineArgs;
