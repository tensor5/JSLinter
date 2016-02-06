import displayErrors from 'displayErrors';
import extend from 'extend';
import parseCommandLineArgs from 'parseCommandLineArgs';
import P from 'promises';
import Node from 'requires';

var cwd = process.cwd();
var flags;
var filePaths;
var homeDir;
var cmdLineOpts;
var parsedArgs;

function printErrorAndExit(err) {
    'use strict';
    console.error(err.toString());
    process.exit(1);
}

try {
    parsedArgs = parseCommandLineArgs(process.argv.slice(2));
} catch (err) {
    printErrorAndExit(err);
}

filePaths = parsedArgs.filePaths;
cmdLineOpts = parsedArgs.options;
flags = parsedArgs.flags;

if (process.platform !== 'win32') {
    homeDir = process.env.HOME;
} else {
    homeDir = process.env.USERPROFILE;
}

if (filePaths.length === 0) {
    printErrorAndExit('No files specified.');
}

function removeShaBang(str, shaBang) {
    'use strict';
    if (shaBang) {
        return str.replace(/^#!.*(\n|\r\n?)/, '');
    }
    return str;
}

function lintFile(homeConf, file, prevReport) {
    'use strict';
    return P.readFile(file, 'utf8')
        .then(function (data) {
            return P.readProjConfs(cwd, Node.path.dirname(file), homeConf)
                .then(function (conf) {
                    var newConf = extend(conf, cmdLineOpts);
                    var report = Node
                        .jslint(removeShaBang(data, flags['sha-bang']),
                                newConf);

                    if (flags.raw) {
                        return prevReport.concat({
                            file: file,
                            option: report.option,
                            stop: report.stop,
                            warnings: report.warnings
                        });
                    }
                    displayErrors(file, report);
                });
        });
}

P.readConf(homeDir, {})
    .then(function (conf) {
        'use strict';
        var promise = filePaths.reduce(function (prom, file) {
            return prom.then(lintFile.bind(undefined, conf, file));
        }, Promise.resolve([]));
        if (flags.raw) {
            return promise.then(function (out) {
                process.stdout.write(JSON.stringify(out));
            });
        }
        return promise;
    })
    .catch(printErrorAndExit);
