import { randomBytes, randomUUID } from "crypto";
import { Authentication } from "../../infrastructure/authentication/authentication";
import { MysqlConnection } from "../../infrastructure/database/mysql_connection";
import { MysqlConnectionPool } from "../../infrastructure/database/mysql_connection_pool";
import { Logger } from "../../infrastructure/logging/logger";
import { JsonResponse, success } from "../../infrastructure/util/json_response";

const logger = new Logger("SUBSCRIBE_CONTROLLER");

export class SubscribeController {
    private static instance: SubscribeController|null = null;

    public static getInstance(): SubscribeController {
        if (SubscribeController.instance === null) {
            SubscribeController.instance = new SubscribeController();
        }

        return SubscribeController.instance;
    }

    public async subscribe(username: string, password: string, inGameName: string): Promise<JsonResponse<{ accessToken: string, verificationCode: string }>> {
        const accessToken = randomUUID();
        const verificationCode = `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
        const salt = randomBytes(128).toString("base64");
        const iterations = 1000;
        const passwordHash = await Authentication.hashPassword(password, salt, iterations);

        await MysqlConnectionPool.transaction(async (connection: MysqlConnection) => {
            const createUserSql = `
                INSERT INTO users (created_at, username, password_hash, password_salt, password_iterations, in_game_name, verification_code)
                VALUES (NOW(), ?, ?, ?, ?, ?, ?)
            `;
            await connection.execute(createUserSql, [username, passwordHash, salt, iterations, inGameName, verificationCode]);

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

        return success({ accessToken: Authentication.encodeToken(accessToken), verificationCode: verificationCode });
    }
}
