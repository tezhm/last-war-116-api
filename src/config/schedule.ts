import { validateInt, validateString } from "../infrastructure/util/helpers";

export const schedule = {
    SLOT_INTERVAL_MINS: validateInt(process.env.SLOT_INTERVAL_MINS),
};
