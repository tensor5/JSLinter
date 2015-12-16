function notBool(key) {
    'use strict';
    throw new Error('\'' + key + '\' must have a Boolean value.');
}

function notKnown(key) {
    'use strict';
    throw new Error('Unexpected option: \'' + key + '\'.');
}

function notNum(key) {
    'use strict';
    throw new Error('\'' + key + '\' must have a numeric value.');
}

export default {
    notBool: notBool,
    notKnown: notKnown,
    notNum: notNum
};
