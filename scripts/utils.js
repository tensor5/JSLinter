var fs = require('fs');

function printDone(a) {
    'use strict';
    console.log('done.');
    return a;
}

function printErrorAndExit(err) {
    'use strict';
    console.error(err.name + ': ' + err.message);
    process.exit(1);
}

function readFile(filename, options) {
    'use strict';
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

function writeFile(filename, data, options) {
    'use strict';
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, data, options, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    printDone: printDone,
    printErrorAndExit: printErrorAndExit,
    readFile: readFile,
    writeFile: writeFile
};
