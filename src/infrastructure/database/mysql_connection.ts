import { MysqlError, PoolConnection } from "mysql";

export class MysqlConnection {
    private connection: PoolConnection;

    public constructor(connection: PoolConnection) {
        this.connection = connection;
    }

    public async execute(query: string, params: string[] | Object = {}): Promise<void> {
        await this.query<void>(query, params);
    }

    public async query<T>(query: string, params: string[] | Object = {}): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            this.connection.query(query, params, (error: MysqlError|null, results) => {
                if (error) {
                    return reject(error);
                }

                return resolve(results);
            });
        });
    }

    public async transaction(callback: (connection: MysqlConnection) => Promise<void>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.connection.beginTransaction(async (error: MysqlError|null) => {
                    if (error) {
                        return reject(error);
                    }

                    await callback(this);

                    this.connection.commit((error: MysqlError|null) => {
                        if (error) {
                            return reject(error);
                        }

                        resolve();
                    });
                });
            } catch (error) {
                try {
                    this.connection.rollback();
                } finally {
                    reject(error);
                }
            }
        });
    }
}
