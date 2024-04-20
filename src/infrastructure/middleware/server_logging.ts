import { IncomingHttpHeaders } from "http";
import { Request, Response } from "express";
import { NextFunction } from "connect";
import { randomUUID } from "crypto";
import { Logger } from "../logging/logger";

const logger = new Logger("SERVER");

export function connectionLogger(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
        const correlationId = randomUUID();
        const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const headers = parseHeaders(req.headers);
        const requestData: Buffer[] = [];
        const oldWrite: any = res.write;
        const oldEnd: any = res.end;
        const responseData: Buffer[] = [];

        if (req.readable) {
            req.on("data", chunk => {
                requestData.push(Buffer.from(chunk));
            });

            req.on("end", () => {
                const body = Buffer.concat(requestData).toString("utf8");
                logger.debug(`[RX] (${correlationId}) ${req.method} ${req.originalUrl} (${ipAddress})\n${headers}${body || "(no body)"}`);
            });
        } else {
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

            if (contentType?.includes("image")) {
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

function parseHeaders(headers: IncomingHttpHeaders): string {
    let parsed = "";

    for (const key in headers) {
        parsed += `    ${key}=${headers[key]}\n`;
    }

    return parsed;
}
