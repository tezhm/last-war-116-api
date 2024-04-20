import { MysqlConnectionPool } from "../../infrastructure/database/mysql_connection_pool";
import { error, JsonResponse, success } from "../../infrastructure/util/json_response";
import { timestampToString } from "../../infrastructure/util/helpers";

const titles = new Set<string>([
    "STRATEGY",
    "SECURITY",
    "DEVELOPMENT",
    "SCIENCE",
    "INTERIOR",
]);

export interface Scheduled {
    timestamp: number;
    inGameName: string;
}

export class ScheduleController {
    private static instance: ScheduleController|null = null;

    public static getInstance(): ScheduleController {
        if (ScheduleController.instance === null) {
            ScheduleController.instance = new ScheduleController();
        }

        return ScheduleController.instance;
    }

    public async queryScheduled(title: string, start: number, end: number): Promise<JsonResponse<{ scheduled: Scheduled[] }>> {
        // Only allowing querying max range of 24 hours for now
        if (!titles.has(title) || start > end || (end - start) > (24 * 60 * 60 * 1000)) {
            return error(undefined, 400);
        }

        const queryScheduleSql = `
            SELECT UNIX_TIMESTAMP(schedules.timestamp) * 1000 AS timestamp,
                   users.in_game_name AS inGameName
            FROM schedules
            JOIN users
            ON schedules.user_fk = users.id
            WHERE schedules.title = ?
            AND schedules.timestamp >= ?
            AND schedules.timestamp <= ?
        `;
        const scheduled = await MysqlConnectionPool.query<Scheduled>(queryScheduleSql, [title, timestampToString(start), timestampToString(end)]);
        return success({ scheduled: scheduled });
    }

    public async reserve(title: string, timestamp: number, userId: number): Promise<JsonResponse> {
        const oneDayInMillis = 24 * 60 * 60 * 1000;
        const currentTime = new Date();
        currentTime.setMinutes(Math.floor(currentTime.getMinutes() / 15) * 15, 0);
        const startTime = currentTime.getTime();

        // Can only reserve 15 minute slots and can only reserve slot within next 24 hours
        if (!titles.has(title) || (timestamp % 900000) !== 0 || timestamp < startTime || timestamp > startTime + oneDayInMillis) {
            return error(undefined, 400);
        }

        try {
            const alreadyReservedSql = `
                SELECT id FROM schedules WHERE user_fk = ? AND timestamp > NOW()
            `;
            const alreadyReserved = await MysqlConnectionPool.query(alreadyReservedSql, [userId]);

            if (alreadyReserved.length > 0) {
                return error({ errors: [{ type: "conflict", msg: "Can only have one pending reservation at a time" }] }, 409);
            }

            const reserveScheduleSql = `
                INSERT INTO schedules (created_at, title, user_fk, timestamp)
                VALUES (NOW(), ?, ?, ?)
            `;
            await MysqlConnectionPool.execute(reserveScheduleSql, [title, userId, timestampToString(timestamp)]);
            return success();
        } catch (e) {
            if (e instanceof Error && e.message.includes("ER_DUP_ENTRY")) {
                return error({ errors: [{ type: "conflict", msg: "Timestamp already reserved" }] }, 409);
            }

            return error(undefined, 500);
        }
    }
}
