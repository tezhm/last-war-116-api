import base32Decode from "base32-decode";
import crypto from "crypto";

export class TwoFactorAuth {
    private static instance: TwoFactorAuth|null = null;

    public static getInstance(): TwoFactorAuth {
        if (TwoFactorAuth.instance === null) {
            TwoFactorAuth.instance = new TwoFactorAuth();
        }

        return TwoFactorAuth.instance;
    }

    public verifyOtpAuthCode(otpAuthCode: string): boolean {
        // Testing matches following format:
        //   - otpauth://totp/www.lastwar116.com:{account}?algorithm=SHA1&digits=6&period=30&issuer=www.lastwar116.com&secret={secret}
        if (!otpAuthCode.startsWith("otpauth://")) {
            return false;
        }

        const otpType = otpAuthCode.substring("otpauth://".length).split("/");

        if (otpType.length !== 2 || otpType[0] !== "totp") {
            return false;
        }

        const label = otpType[1].split(":");

        if (label.length !== 2 || label[0] !== "www.lastwar116.com") {
            return false;
        }

        const account = label[1].split("?");

        if (account.length !== 2 || !account[0]) {
            return false;
        }

        const decoded = decodeURI(account[0]);

        if (encodeURI(decoded) !== account[0] || decoded.match(/\p{L}/gu)?.join('') !== decoded) {
            return false;
        }

        let validAlgorithm = false;
        let validDigits = false;
        let validPeriod = false;
        let validIssuer = false;
        let validSecret = false;

        const params = account[1].split("&");

        for (let i = 0; i < params.length; i++) {
            const current = params[i].split("=");

            if (current.length !== 2) {
                return false;
            }

            switch (current[0]) {
                case "algorithm":
                    if (current[1] !== "SHA1") {
                        return false;
                    }

                    validAlgorithm = true;
                    break;

                case "digits":
                    if (current[1] !== "6") {
                        return false;
                    }

                    validDigits = true;
                    break;

                case "period":
                    if (current[1] !== "30") {
                        return false;
                    }

                    validPeriod = true;
                    break;

                case "issuer":
                    if (current[1] !== "www.lastwar116.com") {
                        return false;
                    }

                    validIssuer = true;
                    break;

                case "secret":
                    try {
                        const token = this.generateTotp(current[1]);

                        if (!this.verifyTotp(token, current[1])) {
                            return false;
                        }

                        validSecret = true;
                        break;
                    } catch {
                        return false;
                    }

                default:
                    return false;
            }
        }

        return validAlgorithm
            && validDigits
            && validPeriod
            && validIssuer
            && validSecret;
    }

    public verifyTotp(token: string, secret: string, window: number = 1): boolean {
        for (let errorWindow = -window; errorWindow <= +window; errorWindow++) {
            const totp = this.generateTotp(secret, errorWindow);

            if (token === totp) {
                return true;
            }
        }

        return false;
    }

    private generateTotp(secret: string, window = 0): string {
        const counter = Math.floor(Date.now() / 30000);
        return this.generateHotp(secret, counter + window);
    }

    private generateHotp(secret: string, counter: number): string {
        const decodedSecret = base32Decode(secret, "RFC4648");
        const buffer = Buffer.alloc(8);

        for (let i = 0; i < 8; i++) {
            buffer[7 - i] = counter & 0xff;
            counter = counter >> 8;
        }

        // Step 1: Generate an HMAC-SHA-1 value
        const hmac = crypto.createHmac("sha1", Buffer.from(decodedSecret));
        hmac.update(buffer);
        const hmacResult = hmac.digest();

        // Step 2: Generate a 4-byte string (Dynamic Truncation)
        const offset = hmacResult[hmacResult.length - 1] & 0xf;
        const code =
            ((hmacResult[offset] & 0x7f) << 24) |
            ((hmacResult[offset + 1] & 0xff) << 16) |
            ((hmacResult[offset + 2] & 0xff) << 8) |
            (hmacResult[offset + 3] & 0xff);

        // Step 3: Compute an HOTP value
        return `${code % 10 ** 6}`.padStart(6, "0");
    }
}
