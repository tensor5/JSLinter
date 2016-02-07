var inFile = 'src/JSLint/jslint.js';
var outFile = 'lib/jslint.js';
var utils = require('./utils');
var printDone = utils.printDone;
var printErrorAndExit = utils.printErrorAndExit;

function requireJSLintPromise(filename) {
    'use strict';
    return new Promise(function (resolve, reject) {
        try {
            resolve(require(filename));
        } catch (err) {
            reject(err);
        }
    });
}

function patchModuleExports(str) {
    'use strict';
    return str.replace('var jslint = ', 'module.exports = ');
}

function patchNode(str) {
    'use strict';
    return str
        .replace('\n/*property\n', '\n/*jslint\n    node\n*/\n\n/*property\n')
        .replace('\n\n/*node module.exports = jslint;*/', '');
}

function propertyDirective(data) {
    'use strict';

    var lineLength = 4;
    var maxLen = 79; // yield output similar to original
    var directive = ['/*property\n    '];
    var properties = Object.keys(data.property).sort();
    var last = properties.length - 1;

    if (properties.length > 0) {
        properties.forEach(function (key, i) {
            if (i === 0) {
                directive.push(key);
                lineLength += key.length;
            } else if (lineLength + key.length + 3 <= maxLen ||
                    (lineLength + key.length + 2 === maxLen && i === last)) {
                directive.push(', ', key);
                lineLength += 2 + key.length;
            } else {
                directive.push(',\n    ', key);
                lineLength = 4 + key.length;
            }
        });
        directive.push('\n*/\n');
        return directive.join('');
    }

    return '';
}

// arr[0]: JSLint
// arr[1]: original source
// arr[2]: patched source
function patchProperty(arr) {
    'use strict';
    return arr[2].replace(/\n\/\*property[^*]*\*\/\n/,
            '\n' + propertyDirective(arr[0](arr[2])));
}

function diffPromise(file1, file2) {
    'use strict';
    return new Promise(function (resolve, reject) {
        require('child_process')
            .spawn('diff', [file1, file2])
            .stdout.on('data', function diffOut(data) {
                resolve(data.toString());
            })
            .on('close', function (code) {
                if (code !== 0) {
                    reject(new Error('diff exited with ' + code.toString()));
                }
            });
    });
}

process.stdout.write('Generating \'' + outFile +
        '\' from original \'' + inFile + '\'... ');

utils.readFile(inFile, 'utf8')
    .then(patchModuleExports)
    .then(patchNode)
    .then(utils.writeFile.bind(undefined, outFile))
    .then(function () {
        'use strict';
        return Promise.all([
            requireJSLintPromise('../' + outFile),
            utils.readFile(inFile, 'utf8'),
            utils.readFile(outFile, 'utf8')
        ]);
    })
    .then(patchProperty)
    .then(utils.writeFile.bind(undefined, outFile))
    .then(printDone)
    .then(function () {
        'use strict';
        console.log('Difference between original and patched:\n');
    })
    .then(diffPromise.bind(undefined, inFile, outFile))
    .then(function (diff) {
        'use strict';
        console.log(diff);
    })
    .catch(printErrorAndExit);
