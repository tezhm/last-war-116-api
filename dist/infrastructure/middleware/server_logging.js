"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionLogger = void 0;
const crypto_1 = require("crypto");
const logger_1 = require("../logging/logger");
const logger = new logger_1.Logger("SERVER");
function connectionLogger() {
    return (req, res, next) => {
        const correlationId = (0, crypto_1.randomUUID)();
        const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const headers = parseHeaders(req.headers);
        const requestData = [];
        const oldWrite = res.write;
        const oldEnd = res.end;
        const responseData = [];
        if (req.readable) {
            req.on("data", chunk => {
                requestData.push(Buffer.from(chunk));
            });
            req.on("end", () => {
                const body = Buffer.concat(requestData).toString("utf8");
                logger.debug(`[RX] (${correlationId}) ${req.method} ${req.originalUrl} (${ipAddress})\n${headers}${body || "(no body)"}`);
            });
        }
        else {
            logger.debug(`[RX] (${correlationId}) ${req.method} ${req.originalUrl} (${ipAddress})\n${headers}(no body)`);
        }
        // @ts-ignore
        res.write = (...args) => {
            responseData.push(Buffer.from(args[0]));
            return oldWrite.apply(res, args);
        };
        // @ts-ignore
        res.end = (...args) => {
            const contentType = res.get("Content-Type");
            if (contentType === null || contentType === void 0 ? void 0 : contentType.includes("image")) {
                logger.debug(`[TX] (${correlationId}) ${res.statusCode} (${contentType})`);
                return oldEnd.apply(res, args);
            }
            if (args[0]) {
                responseData.push(Buffer.from(args[0]));
            }
            const responseBuffer = Buffer.concat(responseData);
            const body = (responseBuffer.length > 2000) ? "TRUNCATED" : responseBuffer.toString("utf8");
            logger.debug(`[TX] (${correlationId}) ${res.statusCode} ${body || "(no body)"}`);
            return oldEnd.apply(res, args);
        };
        next();
    };
}
exports.connectionLogger = connectionLogger;
function parseHeaders(headers) {
    let parsed = "";
    for (const key in headers) {
        parsed += `    ${key}=${headers[key]}\n`;
    }
    return parsed;
}
//# sourceMappingURL=server_logging.js.map