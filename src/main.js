import displayErrors from 'displayErrors';
import extend from 'extend';
import parseCommandLineArgs from 'parseCommandLineArgs';
import P from 'promises';
import Node from 'requires';

var cwd = process.cwd(),
    filePaths,
    homeDir,
    cmdLineOpts,
    parsedArgs;

function printErrorAndExit(err) {
    'use strict';
    if (err instanceof Error) {
        console.error(err.name + ': ' + err.message);
    } else {
        console.error(err);
    }
    process.exit(1);
}

try {
    parsedArgs = parseCommandLineArgs(process.argv.slice(2));
} catch (err) {
    printErrorAndExit(err);
}

filePaths = parsedArgs.filePaths;
cmdLineOpts = parsedArgs.options;

if (process.platform !== 'win32') {
    homeDir = process.env.HOME;
} else {
    homeDir = process.env.USERPROFILE;
}

if (filePaths.length === 0) {
    printErrorAndExit('No files specified.');
}

function lintFile(homeConf, file) {
    'use strict';
    return P.readFile(file, 'utf8')
        .then(function (data) {
            return P.readConfs(cwd, Node.path.dirname(file), homeConf)
                .then(function (conf) {
                    var newConf = extend(conf, cmdLineOpts);
                    displayErrors(file, Node.jslint(data, newConf));
                });
        });
}

P.readConf(homeDir, {})
    .then(function (conf) {
        'use strict';
        return filePaths.reduce(function (prom, file) {
            return prom.then(lintFile.bind(undefined, conf, file));
        }, Promise.resolve());
    })
    .catch(printErrorAndExit);
