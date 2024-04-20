// DO NOT CHANGE ORDER: Guaranteeing dotenv is loaded into process before anything attempts to access env variables
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import { NextFunction } from "connect";
import cors from "cors";
import express, { Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import { server } from "../../config/server";
import { SubscribeController } from "../../controllers/subscribe/subscribe_controller";
import { MysqlConnectionPool } from "../database/mysql_connection_pool";
import { LoginController } from "../../controllers/login/login_controller";
import { ScheduleController } from "../../controllers/schedule/schedule_controller";
import { Logger } from "../logging/logger";
import { authentication, USER_ID_KEY } from "../middleware/authentication";
import { connectionLogger } from "../middleware/server_logging";

const logger = new Logger("SERVER");

// Warm components
MysqlConnectionPool.init();

// Build server
const app = express();

// Middleware
app.use(connectionLogger());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enable cors for localhost requests
if (server.DEV_MODE) {
    app.use(cors());
}

app.post(
    "/v1/subscribe",
    body("username").isString().isLength({ min: 4, max: 20 }),
    body("password").isString().isLength({ min: 8, max: 20 }),
    body("inGameName").isString().isLength({ min: 2, max: 20 }),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const result = await SubscribeController.getInstance().subscribe(
            req.body["username"],
            req.body["password"],
            req.body["inGameName"]
        );
        return res.status(result.status).json(result.body);
    }
);

app.post(
    "/v1/login",
    body("username").isString().isLength({ min: 4, max: 20 }),
    body("password").isString().isLength({ min: 8, max: 20 }),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const result = await LoginController.getInstance().login(
            req.body["username"],
            req.body["password"]
        );
        return res.status(result.status).json(result.body);
    }
);

app.get(
    "/v1/schedule/:title/index",
    authentication(),
    query("start").notEmpty().isNumeric(),
    query("end").notEmpty().isNumeric(),
    async (req: Request<{ title: string }, any, any, { start: number, end: number, _at: string }>, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const result = await ScheduleController.getInstance().queryScheduled(
            req.params.title,
            Number(req.query.start),
            Number(req.query.end)
        );
        return res.status(result.status).json(result.body);
    }
);

app.post(
    "/v1/schedule/:title/reserve/:timestamp",
    authentication(),
    async (req: Request<{ title: string, timestamp: number }, any, any, { _at: string }>, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const result = await ScheduleController.getInstance().reserve(
            req.params.title,
            Number(req.params.timestamp),
            res.locals[USER_ID_KEY]
        );
        return res.status(result.status).json(result.body);
    }
);

// Error handling
app.use((err: any, req: Request, res: Response, _: NextFunction) => {
    logger.error(err);
    return res.status(500).json();
});

// Start server
const port = server.PORT;

app.listen(port, () => {
    logger.info(`Server is running at http://localhost:${port}`);
});
