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
exports.Authentication = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const jwt_1 = require("../../config/jwt");
const crypto_1 = require("crypto");
class Authentication {
    static encodeToken(accessToken) {
        const now = Math.floor(Date.now() / 1000);
        const jwtToken = (0, jsonwebtoken_1.sign)({ accessToken, timestamp: now }, jwt_1.jwt.JWT_SECRET);
        return Buffer.from(jwtToken).toString("base64");
    }
    static decodeToken(token) {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const jwtToken = (0, jsonwebtoken_1.verify)(decoded, jwt_1.jwt.JWT_SECRET);
        if (typeof jwtToken === "string") {
            return null;
        }
        return jwtToken.accessToken;
    }
    static hashPassword(password, salt, iterations) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                (0, crypto_1.pbkdf2)(password, salt, iterations, 64, "sha512", (err, derivedKey) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res(derivedKey.toString("hex"));
                });
            });
        });
    }
}
exports.Authentication = Authentication;
//# sourceMappingURL=authentication.js.map