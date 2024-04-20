import { validateString } from "../infrastructure/util/helpers";

export const jwt = {
    JWT_SECRET: validateString(process.env.JWT_SECRET),
};
