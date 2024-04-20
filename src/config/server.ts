import { validateString } from "../infrastructure/util/helpers";

export const server = {
    PORT: validateString(process.env.SERVER_PORT),
    DEV_MODE: (process.env.DEV_MODE ?? "false") === "true",
};
