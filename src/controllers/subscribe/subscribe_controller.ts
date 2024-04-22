import { randomUUID } from "crypto";
import { Authentication } from "../../infrastructure/authentication/authentication";
import { MysqlConnection } from "../../infrastructure/database/mysql_connection";
import { MysqlConnectionPool } from "../../infrastructure/database/mysql_connection_pool";
import { error, JsonResponse, success } from "../../infrastructure/util/json_response";
import { TwoFactorAuth } from "../../infrastructure/util/two_factor_auth";

export class SubscribeController {
    private static instance: SubscribeController|null = null;

    public static getInstance(): SubscribeController {
        if (SubscribeController.instance === null) {
            SubscribeController.instance = new SubscribeController();
        }

        return SubscribeController.instance;
    }

    public async subscribe(username: string, inGameName: string, otpAuthCode: string): Promise<JsonResponse> {
        const accessToken = randomUUID();
        const verificationCode = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;

        if (!TwoFactorAuth.getInstance().verifyOtpAuthCode(otpAuthCode)) {
            return error({ errors: [{ type: "field", path: "otpAuthCode", location: "query", msg: "Invalid auth code" }] }, 400);
        }

        try {
            await MysqlConnectionPool.transaction(async (connection: MysqlConnection) => {
                const createUserSql = `
                    INSERT INTO users (
                        created_at,
                        username,
                        in_game_name,
                        auth_code_url,
                        verification_code
                    )
                    VALUES (NOW(), ?, ?, ?, ?)
                `;
                await connection.execute(createUserSql, [
                    username,
                    inGameName,
                    otpAuthCode,
                    verificationCode,
                ]);

                const queryUserSql = "SELECT id FROM users WHERE username = ?";
                const user = await connection.query<{ id: number }>(queryUserSql, [username]);

                if (user.length === 0) {
                    throw new Error(`Failed to create user (${username})`);
                }

                const accessTokenSql = `
                    INSERT INTO access_tokens (user_fk, access_token, created_at, expires_at)
                    VALUES (?, ?, NOW(), TIMESTAMPADD(YEAR, 1, NOW()))
                `;
                await connection.execute(accessTokenSql, [user[0].id, accessToken]);
            });
        } catch (e) {
            console.log(e);

            if (e instanceof Error && e.message.includes("ER_DUP_ENTRY")) {
                if (e.message.includes("users_username_unique")) {
                    return error({ errors: [{ type: "conflict", msg: "Username already in use" }] }, 409);
                } else if (e.message.includes("users_in_game_name_unique")) {
                    return error({ errors: [{ type: "conflict", msg: "Account name already in use" }] }, 409);
                }
            }

            return error(undefined, 500);
        }

        return success({ accessToken: Authentication.encodeToken(accessToken), verificationCode: verificationCode });
    }
}
