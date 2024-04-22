import { MysqlConnectionPool } from "../../infrastructure/database/mysql_connection_pool";
import { error, JsonResponse, success } from "../../infrastructure/util/json_response";

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
                   auth_code_url AS otpAuthCode,
                   verification_code AS verificationCode,
                   verified AS isVerified
            FROM users
            WHERE id = ?
        `;
        const user = await MysqlConnectionPool.query<{
            isAdmin: number,
            inGameName: string,
            otpAuthCode: string,
            verificationCode: string,
            isVerified: number
        }>(queryUserSql, [userId]);

        if (user.length === 0) {
            return error(undefined, 404);
        }

        return success({
            isAdmin: Boolean(user[0].isAdmin),
            inGameName: user[0].inGameName,
            otpAuthCode: user[0].otpAuthCode,
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
