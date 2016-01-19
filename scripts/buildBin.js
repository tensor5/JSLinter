var myPlugin = {
    resolveId: function resolveId(moduleName) {
        'use strict';
        return 'src/' + moduleName + '.js';
    }
};
var output = 'jslint';
var utils = require('./utils');
var printDone = utils.printDone;
var printErrorAndExit = utils.printErrorAndExit;

function chmodPromise(path, mode) {
    'use strict';
    return new Promise(function (resolve, reject) {
        require('fs').chmod(path, mode, function onChmodData(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

process.stdout.write('Generating executable bundle... ');

require('rollup')
    .rollup({
        entry: 'main',
        plugins: [myPlugin]
    })
    .then(printDone)
    .then(function writeBundle(bundle) {
        'use strict';
        var jslint = '/*jslint\n    es6, node\n*/\n';

        process.stdout.write('Writing bundle to \'' + output + '\'... ');
        return bundle.generate({
            banner: '#!/usr/bin/env node\n\n' + jslint,
            format: 'cjs',
            useStrict: false
        }).code + '\n';
    })
    .then(utils.writeFile.bind(undefined, output))
    .then(printDone)
    .then(function chMod() {
        'use strict';
        process.stdout.write('Changing mode to 755... ');
        return chmodPromise(output, 493);
    })
    .then(printDone)
    .catch(printErrorAndExit);
