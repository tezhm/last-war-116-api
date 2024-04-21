import { MysqlConnectionPool } from "../../infrastructure/database/mysql_connection_pool";
import { error, JsonResponse, success } from "../../infrastructure/util/json_response";
import { timestampToString } from "../../infrastructure/util/helpers";
import { Authentication } from "../../infrastructure/authentication/authentication";
import { randomBytes } from "crypto";

export class UserController {
    private static instance: UserController|null = null;

    public static getInstance(): UserController {
        if (UserController.instance === null) {
            UserController.instance = new UserController();
        }

        return UserController.instance;
    }

    public async queryInfo(userId: number): Promise<JsonResponse> {
        const queryUserSql = `
            SELECT admin AS isAdmin,
                   in_game_name AS inGameName,
                   verification_code AS verificationCode,
                   verified AS isVerified
            FROM users
            WHERE id = ?
        `;
        const user = await MysqlConnectionPool.query<{
            isAdmin: number,
            inGameName: string,
            verificationCode: string,
            isVerified: number
        }>(queryUserSql, [userId]);

        if (user.length === 0) {
            return error(undefined, 404);
        }

        return success({
            isAdmin: Boolean(user[0].isAdmin),
            inGameName: user[0].inGameName,
            verificationCode: user[0].verificationCode,
            isVerified: Boolean(user[0].isVerified),
        });
    }

    public async changeInGameName(userId: number, inGameName: string): Promise<JsonResponse> {
        try {
            const reserveScheduleSql = "UPDATE users SET in_game_name = ? WHERE id = ?";
            await MysqlConnectionPool.execute(reserveScheduleSql, [inGameName, userId]);
            return success();
        } catch (e) {
            if (e instanceof Error && e.message.includes("ER_DUP_ENTRY")) {
                return error({ errors: [{ type: "conflict", msg: "Account name already in use" }] }, 409);
            }

            return error(undefined, 500);
        }
    }

    public async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<JsonResponse> {
        const queryUserSql = "SELECT password_hash, password_salt, password_iterations FROM users WHERE id = ?";
        const user = await MysqlConnectionPool.query<{ password_hash: string, password_salt: string, password_iterations: number }>(queryUserSql, [userId]);

        if (user.length === 0) {
            return error(undefined, 401);
        }

        const currentPasswordHash = await Authentication.hashPassword(currentPassword, user[0].password_salt, user[0].password_iterations);

        if (currentPasswordHash !== user[0].password_hash) {
            return error();
        }

        const salt = randomBytes(128).toString("base64");
        const iterations = 1000;
        const newPasswordHash = await Authentication.hashPassword(newPassword, salt, iterations);

        const updatePasswordSql = "UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ? WHERE id = ?";
        await MysqlConnectionPool.execute(updatePasswordSql, [newPasswordHash, salt, iterations, userId]);
        return success();
    }

    public async verify(toVerifyId: number, verifierId: number, isAdmin: number): Promise<JsonResponse> {
        if (!isAdmin) {
            return error(undefined, 401);
        }

        if (verifierId === toVerifyId) {
            return error({ errors: [{ type: "conflict", msg: "Cannot verify self" }] }, 409);
        }

        const verifyUserSql = "UPDATE users SET verified = 1 WHERE id = ?";
        await MysqlConnectionPool.execute(verifyUserSql, [toVerifyId]);
        return success();
    }
}
