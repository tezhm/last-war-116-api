import { validateInt, validateString } from "../infrastructure/util/helpers";

export const database = {
    DB_HOST: validateString(process.env.DB_HOST),
    DB_PORT: validateInt(process.env.DB_PORT, 3306),
    DB_USER: validateString(process.env.DB_USER),
    DB_PASSWORD: validateString(process.env.DB_PASSWORD),
    DB_DATABASE: validateString(process.env.DB_DATABASE),
    DB_CONNECTION_LIMIT: validateInt(process.env.DB_CONNECTION_LIMIT, 4),
};
