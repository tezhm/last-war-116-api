import { randomBytes, randomUUID } from "crypto";
import { Authentication } from "../../infrastructure/authentication/authentication";
import { MysqlConnection } from "../../infrastructure/database/mysql_connection";
import { MysqlConnectionPool } from "../../infrastructure/database/mysql_connection_pool";
import { Logger } from "../../infrastructure/logging/logger";
import { error, JsonResponse, success } from "../../infrastructure/util/json_response";

export class LoginController {
    private static instance: LoginController|null = null;

    public static getInstance(): LoginController {
        if (LoginController.instance === null) {
            LoginController.instance = new LoginController();
        }

        return LoginController.instance;
    }

    public async login(username: string, password: string): Promise<JsonResponse<{ accessToken: string }>> {
        const queryUserSql = "SELECT id, password_hash, password_salt, password_iterations FROM users WHERE username = ?";
        const user = await MysqlConnectionPool.query<{ id: number, password_hash: string, password_salt: string, password_iterations: number }>(queryUserSql, [username]);

        if (user.length === 0) {
            return error(undefined, 401);
        }

        const passwordHash = await Authentication.hashPassword(password, user[0].password_salt, user[0].password_iterations);

        if (passwordHash !== user[0].password_hash) {
            return error(undefined, 401);
        }

        const accessToken = randomUUID();
        const accessTokenSql = `
            INSERT INTO access_tokens (user_fk, access_token, created_at, expires_at)
            VALUES (?, ?, NOW(), TIMESTAMPADD(YEAR, 1, NOW()))
        `;
        await MysqlConnectionPool.execute(accessTokenSql, [user[0].id, accessToken]);

        return success({ accessToken: Authentication.encodeToken(accessToken) });
    }
}
