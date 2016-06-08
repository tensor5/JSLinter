/*jslint
    es6, node
*/

/*property
    edition, exports, freeze, jslint, jslintEdition
*/

const jslint = require("./lib/jslint");

module.exports = Object.freeze({
    jslint: jslint,
    jslintEdition: jslint([]).edition
});
