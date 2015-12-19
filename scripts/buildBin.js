var myPlugin = {
        resolveId: function resolveId(moduleName) {
            'use strict';
            return 'src/' + moduleName + '.js';
        }
    },
    output = 'jslint',
    utils = require('./utils'),
    printDone = utils.printDone,
    printErrorAndExit = utils.printErrorAndExit;

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
        var globals = '/*global\n    console, process, Promise, require\n*/\n';

        process.stdout.write('Writing bundle to \'' + output + '\'... ');
        return bundle.write({
            banner: '#!/usr/bin/env node\n\n' + globals,
            dest: output,
            format: 'cjs',
            useStrict: false
        });
    })
    .then(printDone)
    .then(function chMod() {
        'use strict';
        process.stdout.write('Changing mode to 755... ');
        return chmodPromise(output, 493);
    })
    .then(printDone)
    .catch(printErrorAndExit);
