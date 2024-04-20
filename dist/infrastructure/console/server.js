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
const express_1 = __importDefault(require("express"));
const server_1 = require("../../config/server");
const logger_1 = require("../logging/logger");
const logger = new logger_1.Logger("SERVER");
const app = (0, express_1.default)();
// Middleware
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.get("/v1/test", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json({ test: 123 });
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