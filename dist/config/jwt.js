"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwt = void 0;
const helpers_1 = require("../infrastructure/util/helpers");
exports.jwt = {
    JWT_SECRET: (0, helpers_1.validateString)(process.env.JWT_SECRET),
};
//# sourceMappingURL=jwt.js.map