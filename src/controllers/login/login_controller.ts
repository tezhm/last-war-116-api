import { randomUUID } from "crypto";
import { Authentication } from "../../infrastructure/authentication/authentication";
import { MysqlConnectionPool } from "../../infrastructure/database/mysql_connection_pool";
import { error, JsonResponse, success } from "../../infrastructure/util/json_response";
import { TwoFactorAuth } from "../../infrastructure/util/two_factor_auth";

export class LoginController {
    private static instance: LoginController|null = null;

    public static getInstance(): LoginController {
        if (LoginController.instance === null) {
            LoginController.instance = new LoginController();
        }

        return LoginController.instance;
    }

    public async login(username: string, token: string): Promise<JsonResponse<{ accessToken: string }>> {
        const queryUserSql = "SELECT id, auth_code_url FROM users WHERE username = ?";
        const user = await MysqlConnectionPool.query<{ id: number, auth_code_url: string }>(queryUserSql, [username]);

        if (user.length === 0) {
            return error(undefined, 401);
        }

        let secret = user[0].auth_code_url.split("secret=")[1];

        if (secret.includes("&")) {
            secret = secret.split("&")[0];
        }

        if (!TwoFactorAuth.getInstance().verifyTotp(token, secret)) {
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
