"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const helpers_1 = require("../infrastructure/util/helpers");
exports.server = {
    PORT: (0, helpers_1.validateString)(process.env.SERVER_PORT),
};
//# sourceMappingURL=server.js.map