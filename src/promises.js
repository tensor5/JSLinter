import parseConfigurations from "parseConfigurations";
import Node from "requires";

var confFile = ".jslintrc";

function readFile(filename, options) {
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

// 1. readConf(pathname, oldConf)
//
//   Promise to read "pathname" and use it to update oldConf.
//   If "pathname" is a directory, read "pathname/.jslintrc" instead.
//
// 2. readConf([path1, path2, path3], oldConf)
//
//   Same as readConf(path3, readConf(path2, readConf(path1, oldConf)))
//
// 3. readConf("/a/b", "/a/b/c/d", oldConf)
//
//   Same as readConf("/a/b/c/d", readConf("/a/b/c", readConf("/a/b", oldConf)))
function readConf(pathname, pathOrConf, conf) {
    if (typeof pathOrConf === "string") {  // pathOrConf is a path
        var splitPath = Node
            .path.relative(pathname, pathOrConf).split(Node.path.sep);

        // pathOrConf is not in pathname subtree.
        if (splitPath[0] === "..") {
            return Promise.resolve(conf);
        }

        // pathname is the same as pathOrConf.
        if (splitPath[0] === "") {
            return readConf(pathname, conf);
        }

        // pathOrConf is in pathname subtree.
        return readConf(splitPath.reduce((prev, elem, ix) => prev
            .concat(Node.path.join(prev[ix], elem)), ["."]),
                conf);
    }

    // pathOrConf is a configuration object
    return Array.isArray(pathname)
        ? pathname  // array
            .reduce((prom, path) => prom.then(readConf.bind(undefined, path)),
                    Promise.resolve(pathOrConf))
        : readFile(pathname, "utf8")
            .catch(function (err) {
                if (err.code === "EISDIR") {
                    return readFile(Node.path.join(pathname, confFile), "utf8");
                }
                throw err;
            })
            .then(parseConfigurations.bind(undefined, pathOrConf))
            .catch(function (err) {
                if (err.code === "ENOENT") {
                    return pathOrConf;
                }
                throw err;
            });
}

export default Object.freeze({
    readConf: readConf,
    readFile: readFile
});
