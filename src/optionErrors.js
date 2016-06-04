export default {
    notBool: function notBool(key) {
        throw new Error("'" + key + "' must have a Boolean value.");
    },
    notKnown: function notKnown(key) {
        throw new Error("Unexpected option: '" + key + "'.");
    },
    notNum: function notNum(key) {
        throw new Error("'" + key + "' must have a numeric value.");
    },
    unexpectedValue: function unexpectedValue(key) {
        throw new Error("'" + key + "' does not expect a value.");
    }
};
