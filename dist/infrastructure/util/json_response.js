"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.success = void 0;
function success(body) {
    return {
        status: (body !== undefined) ? 200 : 204,
        body,
    };
}
exports.success = success;
function error(body, status = 400) {
    return {
        status,
        body,
    };
}
exports.error = error;
//# sourceMappingURL=json_response.js.map