import { schedule } from "../../config/schedule";
import { MysqlConnectionPool } from "../../infrastructure/database/mysql_connection_pool";
import { timestampToString } from "../../infrastructure/util/helpers";
import { error, JsonResponse, success } from "../../infrastructure/util/json_response";

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

    public async queryScheduled(title: string, start: number, end: number): Promise<JsonResponse<{ info: { slotInterval: number }, scheduled: Scheduled[] }>> {
        // Only allowing querying max range of 25 hours for now
        if (!titles.has(title) || start > end || (end - start) > (25 * 60 * 60 * 1000)) {
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
        return success({
            info: { slotInterval: schedule.SLOT_INTERVAL_MINS },
            scheduled: scheduled,
        });
    }

    public async reserve(title: string, timestamp: number, userId: number): Promise<JsonResponse> {
        const oneDayInMillis = 24 * 60 * 60 * 1000;
        const currentTime = new Date();
        currentTime.setMinutes(Math.floor(currentTime.getMinutes() / schedule.SLOT_INTERVAL_MINS) * schedule.SLOT_INTERVAL_MINS, 0, 0);
        const startTime = currentTime.getTime();

        // Check slot interval matches and within next 24 hours
        if (!titles.has(title) || (timestamp % (schedule.SLOT_INTERVAL_MINS * 60 * 1000)) !== 0 || timestamp < startTime || timestamp > startTime + oneDayInMillis) {
            return error(undefined, 400);
        }

        try {
            const alreadyReservedSql = `
                SELECT id FROM schedules WHERE title = ? AND user_fk = ? AND timestamp > NOW()
            `;
            const alreadyReserved = await MysqlConnectionPool.query(alreadyReservedSql, [title, userId]);

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

    public async cancel(title: string, timestamp: number, userId: number): Promise<JsonResponse> {
        try {
            const reserveScheduleSql = "DELETE FROM schedules WHERE title = ? AND user_fk = ? AND timestamp = ? AND timestamp > NOW()";
            await MysqlConnectionPool.execute(reserveScheduleSql, [title, userId, timestampToString(timestamp)]);
            return success();
        } catch (e) {
            return error(undefined, 500);
        }
    }
}
