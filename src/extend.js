function extend(obj, newProp) {
    "use strict";

    var newObj = {};
    Object.keys(obj).forEach(function (key) {
        newObj[key] = obj[key];
    });
    Object.keys(newProp).forEach(function (key) {
        newObj[key] = newProp[key];
    });
    return newObj;
}

export default extend;
