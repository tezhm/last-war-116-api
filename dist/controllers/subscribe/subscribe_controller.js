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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeController = void 0;
const crypto_1 = require("crypto");
const authentication_1 = require("../../infrastructure/authentication/authentication");
const mysql_connection_pool_1 = require("../../infrastructure/database/mysql_connection_pool");
const logger_1 = require("../../infrastructure/logging/logger");
const json_response_1 = require("../../infrastructure/util/json_response");
const logger = new logger_1.Logger("SUBSCRIBE_CONTROLLER");
class SubscribeController {
    static getInstance() {
        if (SubscribeController.instance === null) {
            SubscribeController.instance = new SubscribeController();
        }
        return SubscribeController.instance;
    }
    subscribe(username, password, inGameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = (0, crypto_1.randomUUID)();
            const verificationCode = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
            const salt = (0, crypto_1.randomBytes)(128).toString("base64");
            const iterations = 1000;
            const passwordHash = yield authentication_1.Authentication.hashPassword(password, salt, iterations);
            yield mysql_connection_pool_1.MysqlConnectionPool.transaction((connection) => __awaiter(this, void 0, void 0, function* () {
                const createUserSql = `
                INSERT INTO users (created_at, username, password_hash, password_salt, password_iterations, in_game_name, verification_code)
                VALUES (NOW(), ?, ?, ?, ?, ?, ?)
            `;
                yield connection.execute(createUserSql, [username, passwordHash, salt, iterations, inGameName, verificationCode]);
                const queryUserSql = "SELECT id FROM users WHERE username = ?";
                const user = yield connection.query(queryUserSql, [username]);
                if (user.length === 0) {
                    throw new Error(`Failed to create user (${username})`);
                }
                const accessTokenSql = `
                INSERT INTO access_tokens (user_fk, access_token, created_at, expires_at)
                VALUES (?, ?, NOW(), TIMESTAMPADD(YEAR, 1, NOW()))
            `;
                yield connection.execute(accessTokenSql, [user[0].id, accessToken]);
            }));
            return (0, json_response_1.success)({ accessToken: authentication_1.Authentication.encodeToken(accessToken), verificationCode: verificationCode });
        });
    }
}
exports.SubscribeController = SubscribeController;
SubscribeController.instance = null;
//# sourceMappingURL=subscribe_controller.js.map