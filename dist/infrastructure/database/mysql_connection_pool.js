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
exports.MysqlConnectionPool = void 0;
const mysql_1 = require("mysql");
const database_1 = require("../../config/database");
const mysql_connection_1 = require("./mysql_connection");
const assert_1 = __importDefault(require("assert"));
class MysqlConnectionPool {
    static init() {
        if (!MysqlConnectionPool.pool) {
            MysqlConnectionPool.pool = (0, mysql_1.createPool)({
                connectionLimit: database_1.database.DB_CONNECTION_LIMIT,
                host: database_1.database.DB_HOST,
                port: database_1.database.DB_PORT,
                user: database_1.database.DB_USER,
                password: database_1.database.DB_PASSWORD,
                database: database_1.database.DB_DATABASE,
            });
        }
    }
    static release() {
        var _a;
        (_a = MysqlConnectionPool.pool) === null || _a === void 0 ? void 0 : _a.end();
        MysqlConnectionPool.pool = null;
    }
    static execute(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, params = {}) {
            yield MysqlConnectionPool.query(query, params);
        });
    }
    static query(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, params = {}) {
            return new Promise((resolve, reject) => {
                MysqlConnectionPool.getPool().query(query, params, (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                });
            });
        });
    }
    static transaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                MysqlConnectionPool.getPool().getConnection((error, connection) => {
                    if (error) {
                        return reject(error);
                    }
                    const wrapper = new mysql_connection_1.MysqlConnection(connection);
                    wrapper.transaction(callback)
                        .then(() => resolve())
                        .catch((error) => reject(error))
                        .finally(() => connection.release());
                });
            });
        });
    }
    static getPool() {
        MysqlConnectionPool.init();
        (0, assert_1.default)(MysqlConnectionPool.pool);
        return MysqlConnectionPool.pool;
    }
}
exports.MysqlConnectionPool = MysqlConnectionPool;
MysqlConnectionPool.pool = null;
//# sourceMappingURL=mysql_connection_pool.js.map