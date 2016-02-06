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

// Promise to read "pathname" and use it to update oldConf.
// If "pathname" is a directory, read "pathname/.jslintrc" instead.
function readConf(pathname, oldConf) {
    'use strict';
    return readFile(pathname, 'utf8')
        .catch(function (err) {
            if (err.code === 'EISDIR') {
                return readFile(Node.path.join(pathname, confFile), 'utf8');
            }
            throw err;
        })
        .then(parseConfigurations.bind(undefined, oldConf))
        .catch(function (err) {
            if (err.code === 'ENOENT') {
                return oldConf;
            }
            throw err;
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
