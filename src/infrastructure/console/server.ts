// DO NOT CHANGE ORDER: Guaranteeing dotenv is loaded into process before anything attempts to access env variables
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import { NextFunction } from "connect";
import express, { Request, Response } from "express";
import { server } from "../../config/server";
import { Logger } from "../logging/logger";

const logger = new Logger("SERVER");
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get(
    "/v1/test",
    async (req: Request, res: Response, next: NextFunction) => {
        return res.status(200).json({ test: 123 });
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
