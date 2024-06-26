import { Request, Response } from "express";
import { NextFunction } from "connect";
import { Authentication } from "../authentication/authentication";
import { MysqlConnectionPool } from "../database/mysql_connection_pool";

export const ACCESS_TOKEN_KEY = "_at";
export const IS_ADMIN_KEY = "_ia";
export const USER_ID_KEY = "_ui";

let accessTokenCache: Record<string, string> = {};

export function authentication(): (req: Request<any, any, any, { _at: string }>, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.query._at;

        if (!(typeof token === "string") || !token) {
            return res.status(401).json();
        }

        const accessToken = (token in accessTokenCache) ? accessTokenCache[token] : Authentication.decodeToken(token);

        if (accessToken === null) {
            return res.status(401).json();
        }

        // Dumb cache invalidation to protect against memory leaks
        if (Object.keys(accessTokenCache).length > 1000) {
            accessTokenCache = {};
        }

        // Decoding token is expensive so caching result
        accessTokenCache[token] = accessToken;

        const queryUserSql = `
            SELECT users.id AS userId,
                   users.admin AS admin
            FROM users
            JOIN access_tokens
            ON users.id = access_tokens.user_fk
            WHERE access_tokens.access_token = ?
            AND access_tokens.expires_at > NOW()
        `;
        const user = await MysqlConnectionPool.query<{ userId: number, admin: number }>(queryUserSql, [accessToken]);

        if (user.length !== 1) {
            return res.status(401).json();
        }

        res.locals[ACCESS_TOKEN_KEY] = accessToken;
        res.locals[IS_ADMIN_KEY] = Boolean(user[0].admin);
        res.locals[USER_ID_KEY] = Number(user[0].userId);

        next();
    };
}
