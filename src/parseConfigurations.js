import extend from "extend";
import optErr from "optionErrors";

function parseConfigurations(oldConfObj, str) {
    "use strict";
    var newConfObj = JSON.parse(str);

    Object.keys(newConfObj).forEach(function isValidOption(key) {
        switch (key) {
        case "bitwise":
        case "browser":
        case "couch":
        case "devel":
        case "es6":
        case "eval":
        case "for":
        case "fudge":
        case "multivar":
        case "node":
        case "this":
        case "white":
            if (typeof newConfObj[key] !== "boolean") {
                optErr.notBool(key);
            }
            break;
        case "maxerr":
        case "maxlen":
            if (typeof newConfObj[key] !== "number") {
                optErr.notNum(key);
            }
            break;
        default:
            optErr.notKnown(key);
        }
    });

    if (oldConfObj && typeof oldConfObj === "object") {
        return extend(oldConfObj, newConfObj);
    }

    return newConfObj;
}

export default parseConfigurations;
