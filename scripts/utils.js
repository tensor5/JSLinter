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

module.exports = {
    printDone: printDone,
    printErrorAndExit: printErrorAndExit
};
