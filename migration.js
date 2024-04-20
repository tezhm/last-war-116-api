let mysql = require("mysql");
let migration = require("mysql-migrations");
let dotenv = require("dotenv");

dotenv.config();

let connection = mysql.createPool({
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT) : 4,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

migration.init(connection, __dirname + "/migrations");
