"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(component) {
        this.component = component ? `[${component}] ` : "";
    }
    debug(message) {
        const timestamp = new Date().toUTCString();
        console.debug(`[${timestamp}] [DEBUG] ${this.component}${message}`);
    }
    info(message) {
        const timestamp = new Date().toUTCString();
        console.debug(`[${timestamp}] [INFO] ${this.component}${message}`);
    }
    warn(message) {
        const timestamp = new Date().toUTCString();
        if (message instanceof Error) {
            console.warn(`[${timestamp}] [WARN] ${this.component}${message.stack}`);
        }
        else {
            console.warn(`[${timestamp}] [WARN] ${this.component}${message}`);
        }
    }
    error(message) {
        const timestamp = new Date().toUTCString();
        if (message instanceof Error) {
            console.error(`[${timestamp}] [ERROR] ${this.component}${message.stack}`);
        }
        else {
            console.error(`[${timestamp}] [ERROR] ${this.component}${message}`);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map