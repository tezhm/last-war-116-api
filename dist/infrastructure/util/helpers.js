"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInt = exports.validateString = void 0;
function validateString(value, _default = undefined) {
    if (value === undefined || value === null || value === "") {
        if (_default === undefined) {
            throw new Error("Value not defined");
        }
        return _default;
    }
    return value;
}
exports.validateString = validateString;
function validateInt(value, _default = undefined) {
    if (value === undefined || value === null || isNaN(value)) {
        if (_default === undefined) {
            throw new Error("Value not defined");
        }
        return _default;
    }
    return parseInt(value);
}
exports.validateInt = validateInt;
//# sourceMappingURL=helpers.js.map