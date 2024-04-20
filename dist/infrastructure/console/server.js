"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// DO NOT CHANGE ORDER: Guaranteeing dotenv is loaded into process before anything attempts to access env variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const server_1 = require("../../config/server");
const subscribe_controller_1 = require("../../controllers/subscribe/subscribe_controller");
const mysql_connection_pool_1 = require("../database/mysql_connection_pool");
const logger_1 = require("../logging/logger");
const server_logging_1 = require("../middleware/server_logging");
const logger = new logger_1.Logger("SERVER");
// Warm components
mysql_connection_pool_1.MysqlConnectionPool.init();
// Build server
const app = (0, express_1.default)();
// Middleware
app.use((0, server_logging_1.connectionLogger)());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.post("/v1/subscribe", (0, express_validator_1.body)("username").isString().isLength({ min: 4, max: 20 }), (0, express_validator_1.body)("password").isString().isLength({ min: 8, max: 20 }), (0, express_validator_1.body)("inGameName").isString().isLength({ min: 2, max: 20 }), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscribe_controller_1.SubscribeController.getInstance().subscribe(req.body["username"], req.body["password"], req.body["inGameName"]);
    return res.status(result.status).json(result.body);
}));
// Error handling
app.use((err, req, res, _) => {
    logger.error(err);
    return res.status(500).json();
});
// Start server
const port = server_1.server.PORT;
app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map