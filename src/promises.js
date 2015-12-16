import parseConfigurations from 'parseConfigurations';
import Node from 'requires';

var confFile = '.jslintrc';

function readFile(filename, options) {
    'use strict';
    return new Promise(function (resolve, reject) {
        Node.fs.readFile(filename, options, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Promise to read "dir/.jslintrc" and use it to update oldConf.
function readConf(dir, oldConf) {
    'use strict';
    return readFile(Node.path.join(dir, confFile), 'utf8')
        .then(parseConfigurations.bind(undefined, oldConf), function (err) {
            switch (err.code) {
            case 'ENOENT':
                return oldConf;
            default:
                throw err;
            }
        });
}

// Promise to read configuration files from basePath to path.
function readConfs(baseDir, dir, oldConf) {
    'use strict';

    var splitPath = Node.path.relative(baseDir, dir).split(Node.path.sep);

    // dir is not in baseDir subtree.
    if (splitPath[0] === '..') {
        return Promise.resolve(oldConf);
    }

    // baseDir is the same as dir.
    if (splitPath[0] === '') {
        return readConf(dir, oldConf);
    }

    // dir is in baseDir subtree.
    return splitPath.reduce(function (prevObj, elem) {
        var newAcc = Node.path.join(prevObj.acc, elem);
        return {
            prom: prevObj.prom.then(readConf.bind(undefined, newAcc)),
            acc: newAcc
        };
    }, {
        prom: readConf('.', oldConf),
        acc: '.'
    }).prom;
}

export default Object.freeze({
    readConf: readConf,
    readConfs: readConfs,
    readFile: readFile
});
