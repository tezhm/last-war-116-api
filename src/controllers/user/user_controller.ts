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

    public async queryInfo(userId: number): Promise<JsonResponse<{ isAdmin: boolean, inGameName: string }>> {
        const queryUserSql = "SELECT admin AS isAdmin, in_game_name AS inGameName FROM users WHERE id = ?";
        const user = await MysqlConnectionPool.query<{ isAdmin: number, inGameName: string }>(queryUserSql, [userId]);

        if (user.length === 0) {
            return error(undefined, 404);
        }

        return success({ isAdmin: Boolean(user[0].isAdmin), inGameName: user[0].inGameName });
    }
}
