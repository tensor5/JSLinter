/*jslint
    es6, node
*/

/*property
    edition, exports, jslint, jslintEdition
*/

const jslint = require("./lib/jslint");

module.exports = {
    jslint: jslint,
    jslintEdition: jslint([]).edition
};
