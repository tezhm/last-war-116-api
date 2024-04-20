import { createPool, MysqlError, Pool, PoolConnection } from "mysql";
import { database } from "../../config/database";
import { MysqlConnection } from "./mysql_connection";
import assert from "assert";

export class MysqlConnectionPool {
    private static pool: Pool|null = null;

    public static init(): void {
        if (!MysqlConnectionPool.pool) {
             MysqlConnectionPool.pool = createPool({
                connectionLimit: database.DB_CONNECTION_LIMIT,
                host: database.DB_HOST,
                port: database.DB_PORT,
                user: database.DB_USER,
                password: database.DB_PASSWORD,
                database: database.DB_DATABASE,
            });
        }
    }

    public static release(): void {
        MysqlConnectionPool.pool?.end();
        MysqlConnectionPool.pool = null;
    }

    public static async execute(query: string, params: string[] | Object = {}): Promise<void> {
        await MysqlConnectionPool.query(query, params);
    }

    public static async query<T>(query: string, params: string[] | Object = {}): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            MysqlConnectionPool.getPool().query(query, params, (error: MysqlError|null, results) => {
                if (error) {
                    return reject(error);
                }

                return resolve(results);
            });
        });
    }

    public static async transaction(callback: (connection: MysqlConnection) => Promise<void>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            MysqlConnectionPool.getPool().getConnection((error: MysqlError, connection: PoolConnection) => {
                if (error) {
                    return reject(error);
                }

                const wrapper = new MysqlConnection(connection);
                wrapper.transaction(callback)
                    .then(() => resolve())
                    .catch((error) => reject(error))
                    .finally(() => connection.release());
            });
        });
    }

    private static getPool(): Pool {
        MysqlConnectionPool.init();
        assert(MysqlConnectionPool.pool);
        return MysqlConnectionPool.pool;
    }
}
