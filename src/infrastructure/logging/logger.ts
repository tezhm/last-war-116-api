export class Logger {
    private readonly component: string;

    public constructor(component?: string) {
        this.component = component ? `[${component}] ` : "";
    }

    public debug(message: string): void {
        const timestamp = new Date().toUTCString();
        console.debug(`[${timestamp}] [DEBUG] ${this.component}${message}`);
    }

    public info(message: string): void {
        const timestamp = new Date().toUTCString();
        console.debug(`[${timestamp}] [INFO] ${this.component}${message}`);
    }

    public warn(message: any): void {
        const timestamp = new Date().toUTCString();

        if (message instanceof Error) {
            console.warn(`[${timestamp}] [WARN] ${this.component}${message.stack}`);
        } else {
            console.warn(`[${timestamp}] [WARN] ${this.component}${message}`);
        }
    }

    public error(message: any): void {
        const timestamp = new Date().toUTCString();

        if (message instanceof Error) {
            console.error(`[${timestamp}] [ERROR] ${this.component}${message.stack}`);
        } else {
            console.error(`[${timestamp}] [ERROR] ${this.component}${message}`);
        }
    }
}
