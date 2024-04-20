"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const helpers_1 = require("../infrastructure/util/helpers");
exports.database = {
    DB_HOST: (0, helpers_1.validateString)(process.env.DB_HOST),
    DB_PORT: (0, helpers_1.validateInt)(process.env.DB_PORT, 3306),
    DB_USER: (0, helpers_1.validateString)(process.env.DB_USER),
    DB_PASSWORD: (0, helpers_1.validateString)(process.env.DB_PASSWORD),
    DB_DATABASE: (0, helpers_1.validateString)(process.env.DB_DATABASE),
    DB_CONNECTION_LIMIT: (0, helpers_1.validateInt)(process.env.DB_CONNECTION_LIMIT, 4),
};
//# sourceMappingURL=database.js.map